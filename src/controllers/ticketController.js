const { validationResult } = require('express-validator');
const ticketService = require('../services/ticketService');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

/**
 * @desc    Purchase tickets
 * @route   POST /api/tickets/purchase
 * @access  Private
 */
const purchaseTickets = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, 'Données invalides', null, errors.array());
  }

  try {
    const result = await ticketService.purchaseTicket(
      req.body.eventId,
      req.user.id,
      req.body
    );

    sendResponse(res, 201, true, 'Tickets achetés avec succès', result);
  } catch (error) {
    sendResponse(res, 400, false, error.message);
  }
});

/**
 * @desc    Get user tickets
 * @route   GET /api/tickets
 * @access  Private
 */
const getUserTickets = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    eventId: req.query.eventId
  };

  const tickets = await ticketService.getUserTickets(req.user.id, filters);

  sendResponse(res, 200, true, 'Tickets récupérés avec succès', { tickets });
});

/**
 * @desc    Get single ticket
 * @route   GET /api/tickets/:id
 * @access  Private
 */
const getTicket = asyncHandler(async (req, res) => {
  const tickets = await ticketService.getUserTickets(req.user.id);
  const ticket = tickets.find(t => t._id.toString() === req.params.id);

  if (!ticket) {
    return sendResponse(res, 404, false, 'Ticket non trouvé');
  }

  sendResponse(res, 200, true, 'Ticket récupéré avec succès', { ticket });
});

/**
 * @desc    Use ticket
 * @route   PUT /api/tickets/:id/use
 * @access  Private (Provider or Admin)
 */
const useTicket = asyncHandler(async (req, res) => {
  try {
    const ticket = await ticketService.useTicket(req.params.id);
    sendResponse(res, 200, true, 'Ticket utilisé avec succès', { ticket });
  } catch (error) {
    sendResponse(res, 400, false, error.message);
  }
});

/**
 * @desc    Request refund
 * @route   POST /api/tickets/:id/refund
 * @access  Private
 */
const requestRefund = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, 'Données invalides', null, errors.array());
  }

  try {
    const result = await ticketService.requestRefund(req.params.id, req.body.reason);
    sendResponse(res, 200, true, 'Remboursement demandé avec succès', result);
  } catch (error) {
    sendResponse(res, 400, false, error.message);
  }
});

/**
 * @desc    Validate ticket by QR code
 * @route   POST /api/tickets/validate
 * @access  Private (Provider or Admin)
 */
const validateTicket = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, 'Données invalides', null, errors.array());
  }

  try {
    const ticket = await ticketService.validateTicketByQRCode(req.body.qrCode);
    sendResponse(res, 200, true, 'Ticket validé avec succès', { ticket });
  } catch (error) {
    sendResponse(res, 400, false, error.message);
  }
});

/**
 * @desc    Get event ticket statistics
 * @route   GET /api/tickets/events/:eventId/stats
 * @access  Private (Provider or Admin)
 */
const getEventTicketStats = asyncHandler(async (req, res) => {
  const stats = await ticketService.getEventTicketStats(req.params.eventId);
  sendResponse(res, 200, true, 'Statistiques récupérées avec succès', { stats });
});

module.exports = {
  purchaseTickets,
  getUserTickets,
  getTicket,
  useTicket,
  requestRefund,
  validateTicket,
  getEventTicketStats
};