const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['order', 'delivery', 'stock', 'promo', 'info', 'user', 'product'],
    default: 'info'
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// Static method to create notification for a user
notificationSchema.statics.createForUser = async function(userId, data) {
  return this.create({
    user: userId,
    ...data
  });
};

// Static method to create notification for multiple users
notificationSchema.statics.createForUsers = async function(userIds, data) {
  const notifications = userIds.map(userId => ({
    user: userId,
    ...data
  }));
  return this.insertMany(notifications);
};

// Static method to create notification for all users with a specific role
notificationSchema.statics.createForRole = async function(role, data) {
  const User = mongoose.model('User');
  const users = await User.find({ role }).select('_id');
  const userIds = users.map(u => u._id);
  return this.createForUsers(userIds, data);
};

module.exports = mongoose.model('Notification', notificationSchema);
