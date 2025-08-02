const express = require('express');
const router = express.Router();
const categorieController = require('../controllers/categorieController');
const { authenticateToken, authorizedRole } = require('../middlewares/auth');

// Public routes
router.get('/', categorieController.getCategories);
router.get('/:id', categorieController.getCategorieById);

// Admin-only routes
router.post(
  '/',
  authenticateToken,
  authorizedRole('admin'),
  categorieController.createCategorie
);

router.put(
  '/:id',
  authenticateToken,
  authorizedRole('admin'),
  categorieController.updateCategorie
);

router.delete(
  '/:id',
  authenticateToken,
  authorizedRole('admin'),
  categorieController.deleteCategorie
);

module.exports = router;