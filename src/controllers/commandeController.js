const Commande = require('../models/Commande');
const Produit = require('../models/Produit');

// GET all orders (protected)
exports.getCommandes = async (req, res) => {
  try {
    let query = {};
    
    // Filter by role
    if (req.user.role === 'client') {
      query.client = req.user.id;
    } else if (req.user.role === 'fournisseur') {
      query.fournisseur = req.user.id;
    }

    const commandes = await Commande.find(query)
      .populate('client', 'nom prenom email')
      .populate('fournisseur', 'nom prenom email')
      .populate('produits.produit', 'nom prix imageURL')
      .sort({ createdAt: -1 });

    res.status(200).json(commandes);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET single order (protected)
exports.getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findOne({ numeroCommande: req.params.id })
      .populate('client', 'nom prenom email')
      .populate('fournisseur', 'nom prenom email')
      .populate('produits.produit', 'nom prix imageURL');

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Verify access
    if (![commande.client._id, commande.fournisseur._id].some(id => id.equals(req.user.id)) ){
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }

    res.status(200).json(commande);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// POST create order (client only)
exports.createCommande = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Réservé aux clients' });
    }

    const { produits, adresseLivraison, modePaiement } = req.body;

    // Validate products
    if (!produits || !Array.isArray(produits) ){
      return res.status(400).json({ message: 'Produits invalides' });
    }

    // Get products with quantities
    const productDetails = await Promise.all(
      produits.map(async item => {
        const produit = await Produit.findById(item.produit);
        if (!produit) throw new Error(`Produit ${item.produit} non trouvé`);
        return {
          produit: item.produit,
          quantite: item.quantite,
          prixUnitaire: produit.prix
        };
      })
    );

    // Create order
    const commande = new Commande({
      client: req.user.id,
      fournisseur: req.body.fournisseur, // Should be validated
      produits: productDetails,
      adresseLivraison,
      modePaiement,
      datePaiement: new Date()
    });

    await commande.save();
    res.status(201).json(commande);
  } catch (error) {
    res.status(400).json({
      message: 'Erreur de création',
      error: error.message
    });
  }
};

// PUT update order status (fournisseur/admin)
exports.updateStatutCommande = async (req, res) => {
  try {
    const commande = await Commande.findOne({ numeroCommande: req.params.id });
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Verify ownership (fournisseur) or admin
    if (!commande.fournisseur.equals(req.user.id)) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Action non autorisée' });
      }
    }

    const updatedCommande = await Commande.findOneAndUpdate(
      { numeroCommande: req.params.id },
      { statutCommande: req.body.statutCommande },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedCommande);
  } catch (error) {
    res.status(400).json({
      message: 'Erreur de mise à jour',
      error: error.message
    });
  }
};

// DELETE order (admin only)
exports.deleteCommande = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Réservé aux administrateurs' });
    }

    const commande = await Commande.findOneAndDelete({ 
      numeroCommande: req.params.id 
    });
    
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    
    res.status(200).json({ message: 'Commande supprimée' });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};