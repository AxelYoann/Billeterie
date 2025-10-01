const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');

/**
 * Service pour la gestion des tickets
 * Implémente la logique métier selon les principes KISS et Clean Code
 */
class TicketService {
  
  /**
   * Acheter des tickets pour un événement
   * @param {string} eventId - ID de l'événement
   * @param {string} buyerId - ID de l'acheteur
   * @param {Object} ticketData - Données du ticket
   * @returns {Promise<Object>} - Résultat de l'achat
   */
  async purchaseTicket(eventId, buyerId, ticketData) {
    const { ticketTypeName, quantity = 1 } = ticketData;

    // Vérifier l'événement
    const event = await Event.findById(eventId);
    if (!event || event.status !== 'published') {
      throw new Error('Événement non disponible pour l\'achat');
    }

    // Vérifier si l'événement n'est pas passé
    if (new Date() > event.dateTime.start) {
      throw new Error('Impossible d\'acheter des tickets pour un événement passé');
    }

    // Trouver le type de ticket
    const ticketType = event.ticketTypes.find(type => type.name === ticketTypeName);
    if (!ticketType) {
      throw new Error('Type de ticket non trouvé');
    }

    // Vérifier la disponibilité
    if (ticketType.quantityAvailable < quantity) {
      throw new Error('Quantité demandée non disponible');
    }

    // Vérifier la limite par personne
    const existingTickets = await Ticket.countDocuments({
      event: eventId,
      buyer: buyerId,
      'ticketType.name': ticketTypeName,
      status: { $in: ['active', 'used'] }
    });

    if (existingTickets + quantity > ticketType.maxPerPerson) {
      throw new Error(`Maximum ${ticketType.maxPerPerson} tickets par personne`);
    }

    // Créer les tickets
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticket = new Ticket({
        event: eventId,
        buyer: buyerId,
        ticketType: {
          name: ticketType.name,
          price: ticketType.price
        },
        paymentInfo: {
          paymentMethod: ticketData.paymentMethod || 'card',
          paymentStatus: 'completed' // Dans un vrai système, ce serait 'pending' initialement
        }
      });

      tickets.push(await ticket.save());
    }

    // Mettre à jour la quantité disponible
    ticketType.quantityAvailable -= quantity;
    await event.save();

    return {
      tickets,
      totalAmount: ticketType.price * quantity,
      event: {
        id: event._id,
        title: event.title,
        dateTime: event.dateTime
      }
    };
  }

  /**
   * Utiliser un ticket
   * @param {string} ticketId - ID du ticket
   * @returns {Promise<Object>} - Ticket utilisé
   */
  async useTicket(ticketId) {
    const ticket = await Ticket.findById(ticketId).populate('event');
    
    if (!ticket) {
      throw new Error('Ticket non trouvé');
    }

    if (ticket.status !== 'active') {
      throw new Error('Ce ticket ne peut pas être utilisé');
    }

    // Vérifier si l'événement a commencé
    const now = new Date();
    const eventStart = new Date(ticket.event.dateTime.start);
    const eventEnd = new Date(ticket.event.dateTime.end);

    if (now < eventStart) {
      throw new Error('L\'événement n\'a pas encore commencé');
    }

    if (now > eventEnd) {
      throw new Error('L\'événement est terminé');
    }

    // Utiliser le ticket
    await ticket.useTicket();
    
    return ticket;
  }

  /**
   * Demander un remboursement
   * @param {string} ticketId - ID du ticket
   * @param {string} reason - Raison du remboursement
   * @returns {Promise<Object>} - Ticket remboursé
   */
  async requestRefund(ticketId, reason) {
    const ticket = await Ticket.findById(ticketId).populate('event');
    
    if (!ticket) {
      throw new Error('Ticket non trouvé');
    }

    if (ticket.status === 'used') {
      throw new Error('Ce ticket ne peut pas être remboursé car il a déjà été utilisé');
    }

    if (ticket.status === 'refunded') {
      throw new Error('Ce ticket a déjà été remboursé');
    }

    // Vérifier la politique de remboursement
    const event = ticket.event;
    const provider = await event.populate('provider');
    
    if (provider.settings.refundPolicy === 'none') {
      throw new Error('Aucun remboursement autorisé pour cet événement');
    }

    // Calculer le montant de remboursement
    let refundAmount = ticket.ticketType.price;
    
    if (provider.settings.refundPolicy === 'partial') {
      // Remboursement partiel basé sur le temps restant
      const now = new Date();
      const eventStart = new Date(event.dateTime.start);
      const timeDiff = eventStart - now;
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      if (daysDiff < 7) { // Moins de 7 jours
        refundAmount *= 0.5; // 50% de remboursement
      } else if (daysDiff < 30) { // Moins de 30 jours
        refundAmount *= 0.8; // 80% de remboursement
      }
      // Plus de 30 jours = remboursement complet
    }

    // Rembourser le ticket
    await ticket.refundTicket(reason, refundAmount);

    // Remettre le ticket en disponibilité
    const ticketType = event.ticketTypes.find(type => type.name === ticket.ticketType.name);
    if (ticketType) {
      ticketType.quantityAvailable += 1;
      await event.save();
    }

    return {
      ticket,
      refundAmount
    };
  }

  /**
   * Obtenir les tickets d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} filters - Filtres optionnels
   * @returns {Promise<Array>} - Liste des tickets
   */
  async getUserTickets(userId, filters = {}) {
    const query = { buyer: userId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.eventId) {
      query.event = filters.eventId;
    }

    const tickets = await Ticket.find(query)
      .populate('event', 'title dateTime venue provider')
      .sort({ purchaseDate: -1 });

    return tickets;
  }

  /**
   * Valider un ticket avec son QR code
   * @param {string} qrCode - Code QR du ticket
   * @returns {Promise<Object>} - Ticket validé
   */
  async validateTicketByQRCode(qrCode) {
    const ticket = await Ticket.findOne({ qrCode }).populate('event buyer');
    
    if (!ticket) {
      throw new Error('Ticket non valide');
    }

    if (ticket.status !== 'active') {
      throw new Error(`Ticket ${ticket.status}`);
    }

    return ticket;
  }

  /**
   * Obtenir les statistiques des tickets pour un événement
   * @param {string} eventId - ID de l'événement
   * @returns {Promise<Object>} - Statistiques
   */
  async getEventTicketStats(eventId) {
    const tickets = await Ticket.find({ event: eventId });
    
    const stats = {
      total: tickets.length,
      active: tickets.filter(t => t.status === 'active').length,
      used: tickets.filter(t => t.status === 'used').length,
      cancelled: tickets.filter(t => t.status === 'cancelled').length,
      refunded: tickets.filter(t => t.status === 'refunded').length,
      totalRevenue: tickets.reduce((sum, ticket) => {
        if (ticket.status !== 'refunded') {
          return sum + ticket.ticketType.price;
        }
        return sum;
      }, 0)
    };

    return stats;
  }
}

module.exports = new TicketService();