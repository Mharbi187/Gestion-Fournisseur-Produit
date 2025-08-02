const express = require('express');
const router = express.Router();
const alerteStockController = require('../controllers/alerteStockController');
const { authenticateToken, authorizedRole } = require('../middlewares/auth');

// GET all alerts (admin/fournisseur)
router.get(
  '/',
  authenticateToken,
  authorizedRole('admin', 'fournisseur'),
  alerteStockController.getAlertesStock
);

// GET single alert (admin/fournisseur)
router.get(
  '/:id',
  authenticateToken,
  authorizedRole('admin', 'fournisseur'),
  alerteStockController.getAlerteById
);

// POST create alert (system auto-triggered)
router.post(
  '/',
  authenticateToken,
  authorizedRole('admin', 'system'),
  alerteStockController.createAlerte
);

// PUT resolve alert (admin/fournisseur)
router.put(
  '/:id/resoudre',
  authenticateToken,
  authorizedRole('admin', 'fournisseur'),
  alerteStockController.resolveAlerte
);

// DELETE alert (admin only)
router.delete(
  '/:id',
  authenticateToken,
  authorizedRole('admin'),
  alerteStockController.deleteAlerte
);

module.exports = router;