const { validationResult } = require('express-validator');
const { User, Event, Ticket, Provider } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

// Dashboard prestataire
const getDashboard = async (req, res) => {
  try {
    const providerId = req.user.id;
    
    // Récupérer les statistiques
    const events = await Event.find({ providerId }).sort({ createdAt: -1 });
    const tickets = await Ticket.find({ eventId: { $in: events.map(e => e._id) } });
    
    // Calculer les métriques
    const totalEvents = events.length;
    const totalTickets = tickets.length;
    const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
    const activeEvents = events.filter(e => new Date(e.endDate) > new Date()).length;
    
    // Événements récents
    const recentEvents = events.slice(0, 5);
    
    // Ventes par mois (derniers 6 mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentTickets = tickets.filter(t => new Date(t.createdAt) >= sixMonthsAgo);
    const salesByMonth = {};
    
    recentTickets.forEach(ticket => {
      const month = new Date(ticket.createdAt).toISOString().slice(0, 7);
      salesByMonth[month] = (salesByMonth[month] || 0) + ticket.price;
    });
    
    res.render('provider/dashboard', {
      user: req.user,
      stats: {
        totalEvents,
        totalTickets,
        totalRevenue,
        activeEvents
      },
      recentEvents,
      salesByMonth
    });
  } catch (error) {
    console.error('Erreur dashboard prestataire:', error);
    res.status(500).render('error', { 
      message: 'Erreur lors du chargement du dashboard',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Page événements
const getEvents = async (req, res) => {
  try {
    const providerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    
    // Construire la requête
    const query = { providerId };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      const now = new Date();
      switch (status) {
        case 'upcoming':
          query.startDate = { $gt: now };
          break;
        case 'ongoing':
          query.startDate = { $lte: now };
          query.endDate = { $gte: now };
          break;
        case 'past':
          query.endDate = { $lt: now };
          break;
      }
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalEvents = await Event.countDocuments(query);
    const totalPages = Math.ceil(totalEvents / limit);
    
    // Ajouter les statistiques de tickets pour chaque événement
    const eventsWithStats = await Promise.all(events.map(async (event) => {
      const tickets = await Ticket.find({ eventId: event._id });
      return {
        ...event.toObject(),
        ticketsSold: tickets.length,
        revenue: tickets.reduce((sum, ticket) => sum + ticket.price, 0)
      };
    }));
    
    res.render('provider/events', {
      user: req.user,
      events: eventsWithStats,
      pagination: {
        currentPage: page,
        totalPages,
        totalEvents,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: { search, status }
    });
  } catch (error) {
    console.error('Erreur page événements:', error);
    res.status(500).render('error', { 
      message: 'Erreur lors du chargement des événements',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Page analytics
const getAnalytics = async (req, res) => {
  try {
    const providerId = req.user.id;
    const period = req.query.period || '30'; // 30, 90, 365 jours
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));
    
    const events = await Event.find({ providerId });
    const tickets = await Ticket.find({ 
      eventId: { $in: events.map(e => e._id) },
      createdAt: { $gte: daysAgo }
    });
    
    // Métriques globales
    const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
    const totalTickets = tickets.length;
    const avgTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;
    const conversionRate = events.length > 0 ? (totalTickets / events.reduce((sum, e) => sum + e.capacity, 0)) * 100 : 0;
    
    // Évolution des ventes par jour
    const salesByDay = {};
    tickets.forEach(ticket => {
      const day = new Date(ticket.createdAt).toISOString().slice(0, 10);
      salesByDay[day] = (salesByDay[day] || 0) + ticket.price;
    });
    
    // Top événements
    const eventStats = {};
    tickets.forEach(ticket => {
      const eventId = ticket.eventId.toString();
      if (!eventStats[eventId]) {
        eventStats[eventId] = { tickets: 0, revenue: 0 };
      }
      eventStats[eventId].tickets++;
      eventStats[eventId].revenue += ticket.price;
    });
    
    const topEvents = await Promise.all(
      Object.entries(eventStats)
        .sort(([,a], [,b]) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(async ([eventId, stats]) => {
          const event = await Event.findById(eventId);
          return {
            event,
            ...stats
          };
        })
    );
    
    // Répartition par catégorie
    const categoryStats = {};
    events.forEach(event => {
      const category = event.category || 'Autre';
      if (!categoryStats[category]) {
        categoryStats[category] = { events: 0, tickets: 0, revenue: 0 };
      }
      categoryStats[category].events++;
      
      const eventTickets = tickets.filter(t => t.eventId.toString() === event._id.toString());
      categoryStats[category].tickets += eventTickets.length;
      categoryStats[category].revenue += eventTickets.reduce((sum, t) => sum + t.price, 0);
    });
    
    res.render('provider/analytics', {
      user: req.user,
      period,
      metrics: {
        totalRevenue,
        totalTickets,
        avgTicketPrice,
        conversionRate
      },
      salesByDay,
      topEvents,
      categoryStats
    });
  } catch (error) {
    console.error('Erreur page analytics:', error);
    res.status(500).render('error', { 
      message: 'Erreur lors du chargement des analytics',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Page profil
const getProfile = async (req, res) => {
  try {
    res.render('provider/profile', {
      user: req.user
    });
  } catch (error) {
    console.error('Erreur page profil:', error);
    res.status(500).render('error', { 
      message: 'Erreur lors du chargement du profil',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    Get all providers (API)
 * @route   GET /api/providers
 * @access  Public
 */
const getProviders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const city = req.query.city || '';
  const verified = req.query.verified;

  // Build query
  const query = { isActive: true };
  
  if (search) {
    query.$text = { $search: search };
  }
  
  if (city) {
    query['address.city'] = new RegExp(city, 'i');
  }
  
  if (verified !== undefined) {
    query.isVerified = verified === 'true';
  }

  // Execute query with pagination
  const startIndex = (page - 1) * limit;
  const total = await Provider.countDocuments(query);
  
  const providers = await Provider.find(query)
    .populate('owner', 'firstName lastName email')
    .select('-__v')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  // Pagination info
  const pagination = {
    current: page,
    total: Math.ceil(total / limit),
    count: providers.length,
    totalCount: total
  };

  sendResponse(res, 200, true, 'Prestataires récupérés avec succès', {
    providers,
    pagination
  });
});

/**
 * @desc    Get single provider
 * @route   GET /api/providers/:id
 * @access  Public
 */
const getProvider = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id)
    .populate('owner', 'firstName lastName email')
    .populate('events');

  if (!provider || !provider.isActive) {
    return sendResponse(res, 404, false, 'Prestataire non trouvé');
  }

  sendResponse(res, 200, true, 'Prestataire récupéré avec succès', { provider });
});

/**
 * @desc    Create new provider
 * @route   POST /api/providers
 * @access  Private (User must be authenticated)
 */
const createProvider = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, 'Données invalides', null, errors.array());
  }

  // Check if user already has a provider
  const existingProvider = await Provider.findOne({ owner: req.user.id });
  if (existingProvider) {
    return sendResponse(res, 400, false, 'Vous avez déjà créé un prestataire');
  }

  const providerData = {
    ...req.body,
    owner: req.user.id
  };

  const provider = await Provider.create(providerData);
  
  // Populate owner info
  await provider.populate('owner', 'firstName lastName email');

  sendResponse(res, 201, true, 'Prestataire créé avec succès', { provider });
});

/**
 * @desc    Update provider
 * @route   PUT /api/providers/:id
 * @access  Private (Owner only or Admin)
 */
const updateProvider = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, 'Données invalides', null, errors.array());
  }

  let provider = await Provider.findById(req.params.id);

  if (!provider) {
    return sendResponse(res, 404, false, 'Prestataire non trouvé');
  }

  // Check ownership
  if (provider.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendResponse(res, 403, false, 'Accès refusé');
  }

  provider = await Provider.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('owner', 'firstName lastName email');

  sendResponse(res, 200, true, 'Prestataire mis à jour avec succès', { provider });
});

/**
 * @desc    Delete provider
 * @route   DELETE /api/providers/:id
 * @access  Private (Owner only or Admin)
 */
const deleteProvider = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);

  if (!provider) {
    return sendResponse(res, 404, false, 'Prestataire non trouvé');
  }

  // Check ownership
  if (provider.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendResponse(res, 403, false, 'Accès refusé');
  }

  // Soft delete - just mark as inactive
  provider.isActive = false;
  await provider.save();

  sendResponse(res, 200, true, 'Prestataire supprimé avec succès');
});

/**
 * @desc    Get provider statistics
 * @route   GET /api/providers/:id/stats
 * @access  Private (Owner only or Admin)
 */
const getProviderStats = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);

  if (!provider) {
    return sendResponse(res, 404, false, 'Prestataire non trouvé');
  }

  // Check ownership
  if (provider.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendResponse(res, 403, false, 'Accès refusé');
  }

  // Get statistics (this would need to be implemented based on your needs)
  const stats = {
    totalEvents: 0,
    activeEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    upcomingEvents: 0
  };

  // Here you would implement the actual statistics calculation
  // For now, returning placeholder data

  sendResponse(res, 200, true, 'Statistiques récupérées avec succès', { stats });
});

// Mise à jour du profil
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const {
      companyName,
      contactName,
      phone,
      description,
      website,
      siret,
      address,
      postalCode,
      city,
      region,
      country
    } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        companyName,
        phone,
        description,
        website,
        siret,
        address,
        postalCode,
        city,
        region,
        country
      },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
};

// Création d'événement
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    const eventData = {
      ...req.body,
      providerId: req.user.id
    };
    
    const event = new Event(eventData);
    await event.save();
    
    res.json({
      success: true,
      message: 'Événement créé avec succès',
      event
    });
  } catch (error) {
    console.error('Erreur création événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'événement'
    });
  }
};

// Mise à jour d'événement
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ _id: id, providerId: req.user.id });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }
    
    Object.assign(event, req.body);
    await event.save();
    
    res.json({
      success: true,
      message: 'Événement mis à jour avec succès',
      event
    });
  } catch (error) {
    console.error('Erreur mise à jour événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'événement'
    });
  }
};

// Suppression d'événement
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ _id: id, providerId: req.user.id });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }
    
    // Vérifier s'il y a des tickets vendus
    const ticketsSold = await Ticket.countDocuments({ eventId: id });
    if (ticketsSold > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un événement avec des tickets vendus'
      });
    }
    
    await Event.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'événement'
    });
  }
};

module.exports = {
  // Pages web prestataire
  getDashboard,
  getEvents,
  getAnalytics,
  getProfile,
  updateProfile,
  createEvent,
  updateEvent,
  deleteEvent,
  // API prestataire
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  getProviderStats
};