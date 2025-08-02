const Livraison = require('../models/Livraison');
const Commande = require('../models/Commande');

// GET all deliveries (protected)
exports.getLivraisons = async (req, res) => {
  try {
    let query = {};
    
    // Filter by role
    if (req.user.role === 'livreur') {
      query.livreur = req.user.id;
    } else if (req.user.role === 'client') {
      const commandes = await Commande.find({ client: req.user.id });
      query.commande = { $in: commandes.map(c => c._id) };
    }

    const livraisons = await Livraison.find(query)
      .populate('commande', 'numeroCommande statutCommande')
      .populate('livreur', 'nom prenom')
      .sort({ createdAt: -1 });

    res.status(200).json(livraisons);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET single delivery (protected)
exports.getLivraisonById = async (req, res) => {
  try {
    const livraison = await Livraison.findById(req.params.id)
      .populate('commande', 'numeroCommande client')
      .populate('livreur', 'nom prenom');

    if (!livraison) {
      return res.status(404).json({ message: 'Livraison non trouvée' });
    }

    // Verify access
    if (req.user.role === 'client') {
      const isClientOrder = livraison.commande.client.equals(req.user.id);
      if (!isClientOrder) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }

    res.status(200).json(livraison);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// POST create delivery (admin/fournisseur only)
exports.createLivraison = async (req, res) => {
  try {
    if (!['admin', 'fournisseur'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    const { commande, dateLivraisonPrevue, adresseLivraison } = req.body;

    // Validate commande exists
    const commandeExists = await Commande.findById(commande);
    if (!commandeExists) {
      return res.status(400).json({ message: 'Commande invalide' });
    }

    const livraison = new Livraison({
      commande,
      dateLivraisonPrevue,
      adresseLivraison: adresseLivraison || commandeExists.adresseLivraison,
      ...req.body
    });

    await livraison.save();
    
    // Update order status to "En préparation"
    await Commande.findByIdAndUpdate(commande, { 
      statutCommande: 'En préparation' 
    });

    res.status(201).json(livraison);
  } catch (error) {
    res.status(400).json({
      message: 'Erreur de création',
      error: error.message
    });
  }
};

// PUT update delivery status (livreur/admin)
exports.updateLivraisonStatus = async (req, res) => {
  try {
    const { statutLivraison, notesLivreur } = req.body;
    const livraison = await Livraison.findById(req.params.id);

    if (!livraison) {
      return res.status(404).json({ message: 'Livraison non trouvée' });
    }

    // Verify authorization
    if (req.user.role === 'livreur' && !livraison.livreur.equals(req.user.id)) {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    const updates = {
      statutLivraison,
      notesLivreur
    };

    // Set effective delivery date if marked as delivered
    if (statutLivraison === 'Livrée') {
      updates.dateLivraisonEffective = new Date();
    }

    const updatedLivraison = await Livraison.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedLivraison);
  } catch (error) {
    res.status(400).json({
      message: 'Erreur de mise à jour',
      error: error.message
    });
  }
};

// DELETE delivery (admin only)
exports.deleteLivraison = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Action réservée aux administrateurs' });
    }

    const livraison = await Livraison.findByIdAndDelete(req.params.id);
    
    if (!livraison) {
      return res.status(404).json({ message: 'Livraison non trouvée' });
    }
    
    res.status(200).json({ message: 'Livraison supprimée' });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};