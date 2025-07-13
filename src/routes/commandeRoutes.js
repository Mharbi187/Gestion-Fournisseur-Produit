const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/commandeController');

// CRUD Routes
router.get('/', commandeController.getCommandes);               // GET all
router.get('/:id', commandeController.getCommandeById);        // GET one
router.post('/', commandeController.createCommande);           // POST create
router.put('/:id', commandeController.updateStatutCommande);  // PUT update status
router.delete('/:id', commandeController.deleteCommande);      // DELETE

module.exports = router;