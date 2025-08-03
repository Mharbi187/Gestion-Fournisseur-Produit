const express = require('express');
const router = express.Router();
const livraisonController = require('../controllers/livraisonController');
const { authenticateToken, authorizedRole } = require('../middleware/auth');

// ADMIN: View all deliveries (from document)
router.get('/',
  authenticateToken,
  authorizedRole(['admin']),
  livraisonController.getLivraisons
);

// CLIENT: Track my deliveries (from document)
router.get('/mes-livraisons',
  authenticateToken,
  authorizedRole(['client']),
  livraisonController.getClientLivraisons
);

// FOURNISSEUR: Confirm delivery (from document)
router.put('/:id/confirmer',
  authenticateToken,
  authorizedRole(['fournisseur']),
  livraisonController.confirmLivraison
);

// Keep existing CRUD routes with proper authentication
router.get('/:id',
  authenticateToken,
  livraisonController.getLivraisonById
);

router.post('/',
  authenticateToken,
  authorizedRole(['admin']), // Assuming only admin can create deliveries
  livraisonController.createLivraison
);

router.delete('/:id',
  authenticateToken,
  authorizedRole(['admin']), // Assuming only admin can delete deliveries
  livraisonController.deleteLivraison
);

module.exports = router;