const express = require('express');
const router = express.Router();
const ligneCommandeController = require('../controllers/ligneCommandeController');

// CRUD Routes
router.get('/', ligneCommandeController.getLignesCommande);          // GET all
router.get('/:id', ligneCommandeController.getLigneCommandeById);   // GET one
router.post('/', ligneCommandeController.createLigneCommande);      // POST create
router.put('/:id', ligneCommandeController.updateLigneCommande);    // PUT update
router.delete('/:id', ligneCommandeController.deleteLigneCommande); // DELETE

module.exports = router;