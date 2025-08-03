const express = require('express');
const router = express.Router();
const categorieController = require('../controllers/categorieController');
const { authenticateToken, authorizedRole } = require('../middleware/auth');

// Public GET routes
router.get('/', categorieController.getCategories);
router.get('/:id', categorieController.getCategorieById);

// ADMIN PROTECTED ROUTES
router.post('/',
  authenticateToken,
  authorizedRole(['admin']),
  categorieController.createCategorie
);

router.put('/:id',
  authenticateToken,
  authorizedRole(['admin']),
  categorieController.updateCategorie
);

router.delete('/:id',
  authenticateToken,
  authorizedRole(['admin']),
  categorieController.deleteCategorie
);

module.exports = router;