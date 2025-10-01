const express = require('express');
const router = express.Router();

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Routes des utilisateurs - À implémenter',
    endpoints: [
      'GET /api/users - Liste des utilisateurs (admin)',
      'GET /api/users/:id - Détails d\'un utilisateur',
      'PUT /api/users/:id - Modifier un utilisateur',
      'DELETE /api/users/:id - Supprimer un utilisateur'
    ]
  });
});

module.exports = router;