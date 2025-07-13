const express = require('express');
const router = express.Router();
const categorieController = require('../controllers/categorieController');

// CRUD Routes
router.get('/', categorieController.getCategories);           // GET all categories
router.get('/:id', categorieController.getCategorieById);    // GET single category
router.post('/', categorieController.createCategorie);       // POST create category
router.put('/:id', categorieController.updateCategorie);     // PUT update category
router.delete('/:id', categorieController.deleteCategorie);  // DELETE category

module.exports = router;