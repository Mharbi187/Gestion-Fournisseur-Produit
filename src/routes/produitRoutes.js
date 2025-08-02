const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');
const { authenticateToken, authorizedRole } = require('../middlewares/auth');

// Public routes
router.get('/', produitController.getProduits);
router.get('/:id', produitController.getProduitById);

// Fournisseur routes
router.post(
  '/',
  authenticateToken,
  authorizedRole('fournisseur'),
  produitController.createProduit
);

router.put(
  '/:id',
  authenticateToken,
  authorizedRole('fournisseur'),
  produitController.updateProduit
);

router.delete(
  '/:id',
  authenticateToken,
  authorizedRole('fournisseur'),
  produitController.deleteProduit
);

// Admin can override
router.put(
  '/admin/:id',
  authenticateToken,
  authorizedRole('admin'),
  produitController.updateProduit
);

router.delete(
  '/admin/:id',
  authenticateToken,
  authorizedRole('admin'),
  produitController.deleteProduit
);

module.exports = router;