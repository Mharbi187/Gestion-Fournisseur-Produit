const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizedRole } = require('../middleware/auth');

// ==============================================
// PUBLIC ROUTES (No authentication required)
// ==============================================
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/register-admin', userController.registerAdmin);

// OTP Routes (Public)
router.post('/verify-otp', userController.verifyOTP);
router.post('/resend-otp', userController.resendOTP);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// ==============================================
// AUTHENTICATED ROUTES (All routes below require valid JWT)
// ==============================================
router.use(authenticateToken);

// Role verification endpoints
router.get('/verify-role', userController.verifyRole);
router.get('/verify-admin-role', 
  authorizedRole(['admin']), 
  userController.verifyAdminRole
);

// User role check
router.get('/role', userController.getUserRole);
router.get('/me', userController.getCurrentUser);
router.put('/change-password', userController.changePassword);

// ==============================================
// ADMIN-ONLY ROUTES
// ==============================================
router.route('/')
  .get(authorizedRole(['admin']), userController.getUsers)
  .post(authorizedRole(['admin']), userController.createUser);

// ==============================================
// USER CRUD OPERATIONS
// ==============================================
router.route('/:id')
  .get(userController.getUserById)       // Any authenticated user
  .put(userController.updateUser)        // Owner or admin (add isOwnerOrAdmin middleware)
  .delete(authorizedRole(['admin']), userController.deleteUser); // Admin only

module.exports = router;