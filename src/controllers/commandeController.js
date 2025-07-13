const Commande = require('../models/Commande');

// GET all orders
exports.getCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find().sort({ dateCommande: -1 }); // Newest first
    res.status(200).json(commandes);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des commandes',
      error: error.message 
    });
  }
};

// GET single order by ID
exports.getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findOne({ numeroCommande: req.params.id });
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.status(200).json(commande);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// POST create new order
exports.createCommande = async (req, res) => {
  try {
    const { 
      numeroCommande, 
      totalCommande, 
      taxesAppliquees, 
      adresseLivraison 
    } = req.body;

    // Required field validation
    if (!numeroCommande || !totalCommande || !adresseLivraison) {
      return res.status(400).json({ 
        message: 'Numéro de commande, total et adresse sont obligatoires' 
      });
    }

    const commande = new Commande({
      numeroCommande,
      totalCommande,
      taxesAppliquees: taxesAppliquees || 0,
      adresseLivraison,
      ...req.body // Spread other fields (statutCommande, modePaiement etc.)
    });

    await commande.save();
    res.status(201).json(commande);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      res.status(400).json({ 
        message: 'Ce numéro de commande existe déjà' 
      });
    } else {
      res.status(400).json({ 
        message: 'Erreur de création de commande',
        error: error.message 
      });
    }
  }
};

// PUT update order status
exports.updateStatutCommande = async (req, res) => {
  try {
    const { statutCommande } = req.body;
    const commande = await Commande.findOneAndUpdate(
      { numeroCommande: req.params.id },
      { statutCommande },
      { new: true, runValidators: true }
    );

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.status(200).json(commande);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur de mise à jour',
      error: error.message 
    });
  }
};

// DELETE order
exports.deleteCommande = async (req, res) => {
  try {
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
      error: error.message 
    });
  }
};