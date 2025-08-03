const express = require('express');
const router = express.Router();
const rapportController = require('../controllers/rapportController');
const { authenticateToken, authorizedRole } = require('../middleware/auth');

// ADMIN: Generate PDF report (from document)
router.post('/',
  authenticateToken,
  authorizedRole(['admin']),
  rapportController.generatePDFReport
);

// FOURNISSEUR: View sales statistics (from document)
router.get('/mes-ventes',
  authenticateToken,
  authorizedRole(['fournisseur']),
  rapportController.getSalesStats
);

// Keep existing CRUD routes with proper authentication
router.get('/',
  authenticateToken,
  authorizedRole(['admin']),
  rapportController.getRapports
);

router.get('/:id',
  authenticateToken,
  authorizedRole(['admin']),
  rapportController.getRapportById
);

router.put('/:id',
  authenticateToken,
  authorizedRole(['admin']),
  rapportController.updateRapport
);

router.delete('/:id',
  authenticateToken,
  authorizedRole(['admin']),
  rapportController.deleteRapport
);

module.exports = router;