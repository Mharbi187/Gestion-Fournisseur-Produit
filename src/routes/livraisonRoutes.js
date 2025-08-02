const express = require('express');
const router = express.Router();
const livraisonController = require('../controllers/livraisonController');
const { authenticateToken, authorizedRole } = require('../middlewares/auth');

// Admin/Fournisseur routes
router.post(
  '/',
  authenticateToken,
  authorizedRole('admin', 'fournisseur'),
  livraisonController.createLivraison
);

// Shared protected routes
router.get(
  '/',
  authenticateToken,
  livraisonController.getLivraisons
);

router.get(
  '/:id',
  authenticateToken,
  livraisonController.getLivraisonById
);

// Livreur routes
router.put(
  '/:id/status',
  authenticateToken,
  authorizedRole('livreur', 'admin'),
  livraisonController.updateLivraisonStatus
);

// Admin routes
router.delete(
  '/:id',
  authenticateToken,
  authorizedRole('admin'),
  livraisonController.deleteLivraison
);

// Client-specific route
router.get(
  '/mes-livraisons',
  authenticateToken,
  authorizedRole('client'),
  async (req, res) => {
    // Custom implementation for client's deliveries view
    const livraisons = await Livraison.find()
      .populate({
        path: 'commande',
        match: { client: req.user.id }
      })
      .exec();
    
    res.json(livraisons.filter(l => l.commande));
  }
);

module.exports = router;