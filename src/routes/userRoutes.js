const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizedRole } = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
// ADMIN ONLY ROUTES
router.post('/',
  authenticateToken,
  authorizedRole(['admin']),
  userController.createUser
);

router.get('/',
  authenticateToken,
  authorizedRole(['admin']),
  userController.getUsers
);

// PROTECTED ROUTES (Admin can access other users' profiles)
router.get('/:id',
  authenticateToken,
  userController.getUserById
);

router.put('/:id',
  authenticateToken,
  userController.updateUser
);

router.delete('/:id',
  authenticateToken,
  authorizedRole(['admin']),
  userController.deleteUser
);

module.exports = router;