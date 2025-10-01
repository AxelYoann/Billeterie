const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/providerController');
const { requireAuth, requireProvider } = require('../middleware/auth');

const router = express.Router();

// ==============================================
// ROUTES WEB PRESTATAIRE (avec authentification)
// ==============================================

// Pages prestataires (nécessitent authentification + rôle prestataire)
router.get('/dashboard', requireAuth, requireProvider, getDashboard);
router.get('/events', requireAuth, requireProvider, getEvents);
router.get('/analytics', requireAuth, requireProvider, getAnalytics);
router.get('/profile', requireAuth, requireProvider, getProfile);

// Actions prestataires
router.post('/profile', [
  requireAuth,
  requireProvider,
  body('companyName').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().trim().isMobilePhone('fr-FR'),
  body('website').optional().isURL(),
  body('siret').optional().trim().isLength({ min: 14, max: 14 }),
  body('postalCode').optional().trim().isPostalCode('FR'),
  body('country').optional().isIn(['FR', 'BE', 'CH', 'CA'])
], updateProfile);

router.post('/events', [
  requireAuth,
  requireProvider,
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('La description doit contenir entre 10 et 2000 caractères'),
  body('category').isIn(['Concert', 'Théâtre', 'Sport', 'Conférence', 'Festival', 'Exposition', 'Autre']).withMessage('Catégorie invalide'),
  body('startDate').isISO8601().withMessage('Date de début invalide'),
  body('endDate').isISO8601().withMessage('Date de fin invalide'),
  body('capacity').isInt({ min: 1, max: 100000 }).withMessage('La capacité doit être entre 1 et 100000'),
  body('price').isFloat({ min: 0 }).withMessage('Le prix doit être positif'),
  body('location').trim().isLength({ min: 5, max: 200 }).withMessage('Le lieu doit contenir entre 5 et 200 caractères')
], createEvent);

router.put('/events/:id', [
  requireAuth,
  requireProvider,
  body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }),
  body('category').optional().isIn(['Concert', 'Théâtre', 'Sport', 'Conférence', 'Festival', 'Exposition', 'Autre']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('capacity').optional().isInt({ min: 1, max: 100000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('location').optional().trim().isLength({ min: 5, max: 200 })
], updateEvent);

router.delete('/events/:id', requireAuth, requireProvider, deleteEvent);

// ==============================================
// ROUTES API PRESTATAIRE (publiques)
// ==============================================

// Validation rules pour les prestataires
const providerValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La description doit contenir entre 10 et 1000 caractères'),
  body('category')
    .isIn(['restaurant', 'hotel', 'entertainment', 'sports', 'culture', 'other'])
    .withMessage('Catégorie invalide'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('phone')
    .optional()
    .isMobilePhone('fr-FR')
    .withMessage('Numéro de téléphone invalide'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Site web invalide'),
  body('address.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Adresse invalide'),
  body('address.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Ville invalide'),
  body('address.postalCode')
    .trim()
    .isPostalCode('FR')
    .withMessage('Code postal invalide'),
  body('address.country')
    .isIn(['FR', 'BE', 'CH', 'CA'])
    .withMessage('Pays invalide')
];

// Routes API publiques
router.get('/api', getProviders);
router.get('/api/:id', getProvider);

// Routes API protégées
router.post('/api', requireAuth, providerValidationRules, createProvider);
router.put('/api/:id', requireAuth, providerValidationRules, updateProvider);
router.delete('/api/:id', requireAuth, deleteProvider);
router.get('/api/:id/stats', requireAuth, getProviderStats);

module.exports = router;