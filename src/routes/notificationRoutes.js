const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect, isAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User routes
router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', deleteAllNotifications);

// Admin only - create notifications for users
router.post('/', isAdmin, createNotification);

module.exports = router;
