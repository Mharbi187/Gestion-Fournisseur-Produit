const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizedRole } = require('../middlewares/auth');

// Public authentication routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected admin routes
router.get('/', 
  authenticateToken, 
  authorizedRole('admin'), 
  userController.getUsers
);

router.post('/',
  authenticateToken,
  authorizedRole('admin'),
  userController.createUser
);

// Protected user profile route
router.put('/:id',
  authenticateToken,
  (req, res, next) => {
    // Allow admin or profile owner
    if (req.user.role === 'admin' || req.user.id === req.params.id) {
      return next();
    }
    return res.status(403).json({ message: 'Accès non autorisé' });
  },
  userController.updateUser
);

// Protected admin route
router.delete('/:id',
  authenticateToken,
  authorizedRole('admin'),
  userController.deleteUser
);

module.exports = router;