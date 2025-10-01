const express = require('express');
const { body } = require('express-validator');
const {
  purchaseTickets,
  getUserTickets,
  getTicket,
  useTicket,
  requestRefund,
  validateTicket,
  getEventTicketStats
} = require('../controllers/ticketController');

const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const purchaseValidation = [
  body('eventId')
    .isMongoId()
    .withMessage('ID d\'événement invalide'),
  body('ticketTypeName')
    .trim()
    .notEmpty()
    .withMessage('Le type de ticket est requis'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('La quantité doit être entre 1 et 10'),
  body('paymentMethod')
    .optional()
    .isIn(['card', 'paypal', 'transfer'])
    .withMessage('Méthode de paiement invalide')
];

const refundValidation = [
  body('reason')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('La raison doit contenir entre 10 et 200 caractères')
];

const validateQRValidation = [
  body('qrCode')
    .trim()
    .notEmpty()
    .withMessage('Le code QR est requis')
];

// Routes
router.get('/', authenticate, getUserTickets);
router.post('/purchase', authenticate, purchaseValidation, purchaseTickets);
router.get('/:id', authenticate, getTicket);
router.put('/:id/use', authenticate, authorize('provider', 'admin'), useTicket);
router.post('/:id/refund', authenticate, refundValidation, requestRefund);
router.post('/validate', authenticate, authorize('provider', 'admin'), validateQRValidation, validateTicket);
router.get('/events/:eventId/stats', authenticate, authorize('provider', 'admin'), getEventTicketStats);

module.exports = router;