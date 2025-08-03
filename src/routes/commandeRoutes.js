const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/commandeController');
const { authenticateToken, authorizedRole } = require('../middleware/auth');

// CLIENT ROUTES (from document)
router.post('/',
  authenticateToken,
  authorizedRole(['client']),
  commandeController.createCommande
);

router.get('/mes-commandes',
  authenticateToken,
  authorizedRole(['client']),
  commandeController.getClientCommandes
);

// FOURNISSEUR ROUTES (from document)
router.get('/fournisseur',
  authenticateToken,
  authorizedRole(['fournisseur']),
  commandeController.getFournisseurCommandes
);

// ADMIN ROUTES (from document)
router.get('/',
  authenticateToken,
  authorizedRole(['admin']),
  commandeController.getAllCommandes
);

// Keep your existing routes for other operations
router.get('/:id',
  authenticateToken,
  commandeController.getCommandeById
);

router.put('/:id',
  authenticateToken,
  commandeController.updateStatutCommande
);

module.exports = router;