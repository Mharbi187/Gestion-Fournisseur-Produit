const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');
const { authenticateToken, authorizedRole } = require('../middleware/auth');

// Public GET routes (Client access)
router.get('/', produitController.getProduits);          // GET all
router.get('/:id', produitController.getProduitById);    // GET one

// Fournisseur protected routes
router.post('/',
  authenticateToken,
  authorizedRole(['fournisseur']),
  produitController.createProduit
);

router.put('/:id',
  authenticateToken,
  authorizedRole(['fournisseur']),
  produitController.updateProduit
);

router.delete('/:id',
  authenticateToken,
  authorizedRole(['fournisseur']),
  produitController.deleteProduit
);

module.exports = router;