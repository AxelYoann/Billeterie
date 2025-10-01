const express = require('express');
const router = express.Router();

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Routes des événements - À implémenter',
    endpoints: [
      'GET /api/events - Liste des événements',
      'POST /api/events - Créer un événement',
      'GET /api/events/:id - Détails d\'un événement',
      'PUT /api/events/:id - Modifier un événement',
      'DELETE /api/events/:id - Supprimer un événement',
      'GET /api/events/search - Rechercher des événements'
    ]
  });
});

module.exports = router;