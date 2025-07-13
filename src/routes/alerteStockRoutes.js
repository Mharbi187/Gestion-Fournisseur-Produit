const express = require('express');
const router = express.Router();
const alerteStockController = require('../controllers/alerteStockController');

// CRUD Routes
router.get('/', alerteStockController.getAlertesStock);       // GET all alerts
router.get('/:id', alerteStockController.getAlerteById);     // GET single alert
router.post('/', alerteStockController.createAlerte);        // POST create alert
router.delete('/:id', alerteStockController.deleteAlerte);   // DELETE alert

module.exports = router;