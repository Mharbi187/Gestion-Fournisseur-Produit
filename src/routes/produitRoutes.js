const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');

// GET all products
router.get('/', produitController.getProduits);

// GET single product
router.get('/:id', produitController.getProduitById);

// POST create product
router.post('/', produitController.createProduit);

module.exports = router;