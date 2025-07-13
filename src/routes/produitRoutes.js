const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');

// CRUD Routes
router.get('/', produitController.getProduits);          // GET all
router.get('/:id', produitController.getProduitById);    // GET one
router.post('/', produitController.createProduit);       // POST create
router.put('/:id', produitController.updateProduit);     // PUT update
router.delete('/:id', produitController.deleteProduit);  // DELETE

module.exports = router;