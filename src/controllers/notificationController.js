const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all notifications for logged-in user
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
      read: false 
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message
    });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Notification supprimée'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// Delete all notifications for user
exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });

    res.json({
      success: true,
      message: 'Toutes les notifications ont été supprimées'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// Create notification (admin only)
exports.createNotification = async (req, res) => {
  try {
    const { userId, userIds, role, type, title, message, link } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Titre et message sont requis'
      });
    }

    let notifications;

    // Create for specific user
    if (userId) {
      notifications = await Notification.createForUser(userId, {
        type: type || 'info',
        title,
        message,
        link
      });
    }
    // Create for multiple users
    else if (userIds && Array.isArray(userIds)) {
      notifications = await Notification.createForUsers(userIds, {
        type: type || 'info',
        title,
        message,
        link
      });
    }
    // Create for all users with a specific role
    else if (role) {
      notifications = await Notification.createForRole(role, {
        type: type || 'info',
        title,
        message,
        link
      });
    }
    else {
      return res.status(400).json({
        success: false,
        message: 'userId, userIds ou role est requis'
      });
    }

    res.status(201).json({
      success: true,
      data: notifications,
      message: 'Notification(s) créée(s) avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création',
      error: error.message
    });
  }
};

// Get unread count only
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      read: false
    });

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur',
      error: error.message
    });
  }
};

// Helper function to create notifications from other parts of the app
exports.notifyUser = async (userId, type, title, message, link = null) => {
  try {
    return await Notification.createForUser(userId, { type, title, message, link });
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Helper to notify on order status change
exports.notifyOrderStatus = async (userId, orderId, status) => {
  const statusMessages = {
    'en_attente': { title: 'Commande en attente', message: `Votre commande #${orderId} est en attente de traitement.` },
    'confirmee': { title: 'Commande confirmée', message: `Votre commande #${orderId} a été confirmée!` },
    'en_preparation': { title: 'Commande en préparation', message: `Votre commande #${orderId} est en cours de préparation.` },
    'expediee': { title: 'Commande expédiée', message: `Votre commande #${orderId} a été expédiée!` },
    'livree': { title: 'Commande livrée', message: `Votre commande #${orderId} a été livrée. Merci de votre confiance!` },
    'annulee': { title: 'Commande annulée', message: `Votre commande #${orderId} a été annulée.` }
  };

  const info = statusMessages[status.toLowerCase()] || {
    title: 'Mise à jour commande',
    message: `Votre commande #${orderId} a été mise à jour: ${status}`
  };

  return exports.notifyUser(userId, 'order', info.title, info.message, `/orders/${orderId}`);
};

// Helper to notify on delivery update
exports.notifyDelivery = async (userId, deliveryId, status) => {
  const statusMessages = {
    'en_cours': { title: '🚚 Livraison en cours', message: 'Votre colis est en route!' },
    'livree': { title: '✅ Livraison effectuée', message: 'Votre colis a été livré avec succès!' },
    'echec': { title: '❌ Échec de livraison', message: 'La livraison a échoué. Nous vous contacterons.' }
  };

  const info = statusMessages[status.toLowerCase()] || {
    title: 'Mise à jour livraison',
    message: `Statut de livraison: ${status}`
  };

  return exports.notifyUser(userId, 'delivery', info.title, info.message, `/deliveries/${deliveryId}`);
};

// Helper to notify low stock (for suppliers)
exports.notifyLowStock = async (supplierId, productName, currentStock) => {
  return exports.notifyUser(
    supplierId,
    'stock',
    '⚠️ Stock faible',
    `Le produit "${productName}" n'a plus que ${currentStock} unités en stock.`,
    '/fournisseur-dashboard'
  );
};
