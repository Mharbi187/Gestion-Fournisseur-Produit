const express = require('express');
const router = express.Router();
const livraisonController = require('../controllers/livraisonController');

// CRUD Routes
router.get('/', livraisonController.getLivraisons);               // GET all
router.get('/:id', livraisonController.getLivraisonById);        // GET one
router.post('/', livraisonController.createLivraison);           // POST create
router.put('/:id', livraisonController.updateLivraisonStatus);  // PUT update status
router.delete('/:id', livraisonController.deleteLivraison);      // DELETE

module.exports = router;