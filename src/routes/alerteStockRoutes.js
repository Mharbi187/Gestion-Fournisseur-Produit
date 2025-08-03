const express = require('express');
const router = express.Router();
const alerteStockController = require('../controllers/alerteStockController');
const { authenticateToken, authorizedRole } = require('../middleware/auth');

// ADMIN: Get all stock alerts (from document)
router.get('/',
  authenticateToken,
  authorizedRole(['admin']),
  alerteStockController.getAlertesStock
);

// ADMIN: Resolve alert (from document)
router.put('/:id/resoudre',
  authenticateToken,
  authorizedRole(['admin']),
  alerteStockController.resolveAlerte
);

// Keep existing routes with proper authentication
router.post('/',
  authenticateToken,
  authorizedRole(['admin']),
  alerteStockController.createAlerte
);

router.get('/:id',
  authenticateToken,
  authorizedRole(['admin']),
  alerteStockController.getAlerteById
);

router.delete('/:id',
  authenticateToken,
  authorizedRole(['admin']),
  alerteStockController.deleteAlerte
);

module.exports = router;