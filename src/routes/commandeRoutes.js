const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/commandeController');
const { authenticateToken, authorizedRole } = require('../middlewares/auth');

// Client routes
router.post(
  '/',
  authenticateToken,
  authorizedRole('client'),
  commandeController.createCommande
);

// Shared protected routes
router.get(
  '/',
  authenticateToken,
  commandeController.getCommandes
);

router.get(
  '/:id',
  authenticateToken,
  commandeController.getCommandeById
);

// Fournisseur routes
router.put(
  '/:id/statut',
  authenticateToken,
  authorizedRole('fournisseur', 'admin'),
  commandeController.updateStatutCommande
);

// Admin routes
router.delete(
  '/:id',
  authenticateToken,
  authorizedRole('admin'),
  commandeController.deleteCommande
);

module.exports = router;