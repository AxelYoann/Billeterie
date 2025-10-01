const { validationResult } = require('express-validator');
const Provider = require('../models/Provider');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

/**
 * @desc    Get all providers
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

module.exports = {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  getProviderStats
};