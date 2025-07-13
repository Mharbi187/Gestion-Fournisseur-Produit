const express = require('express');
const router = express.Router();
const rapportController = require('../controllers/rapportController');

// CRUD Routes
router.get('/', rapportController.getRapports);           // GET all
router.get('/:id', rapportController.getRapportById);     // GET one
router.post('/', rapportController.createRapport);        // POST create
router.put('/:id', rapportController.updateRapport);      // PUT update
router.delete('/:id', rapportController.deleteRapport);   // DELETE

module.exports = router;