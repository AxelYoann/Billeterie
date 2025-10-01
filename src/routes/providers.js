const express = require('express');
const { body } = require('express-validator');
const {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  getProviderStats
} = require('../controllers/providerController');

const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const providerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('La description doit contenir entre 10 et 500 caractères'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Veuillez entrer un email valide'),
  body('phone')
    .isMobilePhone('fr-FR')
    .withMessage('Veuillez entrer un numéro de téléphone français valide'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('La ville est requise'),
  body('address.postalCode')
    .matches(/^[0-9]{5}$/)
    .withMessage('Le code postal doit contenir 5 chiffres'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Veuillez entrer une URL valide')
];

// Routes
router.get('/', getProviders);
router.get('/:id', getProvider);
router.post('/', authenticate, authorize('provider', 'admin'), providerValidation, createProvider);
router.put('/:id', authenticate, providerValidation, updateProvider);
router.delete('/:id', authenticate, deleteProvider);
router.get('/:id/stats', authenticate, getProviderStats);

module.exports = router;