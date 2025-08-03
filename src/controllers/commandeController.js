const Commande = require('../models/Commande');

// ADMIN: Get all orders (from document)
exports.getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find().sort({ dateCommande: -1 });
    res.status(200).json({
      success: true,
      data: commandes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// CLIENT: Create order (from document)
exports.createCommande = async (req, res) => {
  try {
    const commandeData = req.body;
    commandeData.client = req.user.userId; // Add client ID from JWT
    
    const commande = new Commande(commandeData);
    await commande.save();
    
    res.status(201).json({
      success: true,
      data: commande
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur de création',
      error: error.message
    });
  }
};

// CLIENT: Get client's orders (from document)
exports.getClientCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find({ client: req.user.userId })
      .sort({ dateCommande: -1 });
      
    res.status(200).json({
      success: true,
      data: commandes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// FOURNISSEUR: Get orders for fournisseur (from document)
exports.getFournisseurCommandes = async (req, res) => {
  try {
    // Assuming products in orders reference fournisseur
    const commandes = await Commande.find({
      'produits.produit.fournisseur': req.user.userId
    }).sort({ dateCommande: -1 });
    
    res.status(200).json({
      success: true,
      data: commandes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Keep your existing methods exactly as they were
exports.getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findOne({ numeroCommande: req.params.id });
    if (!commande) {
      return res.status(404).json({ 
        success: false,
        message: 'Commande non trouvée' 
      });
    }
    res.status(200).json({
      success: true,
      data: commande
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

exports.updateStatutCommande = async (req, res) => {
  try {
    const { statutCommande } = req.body;
    const commande = await Commande.findOneAndUpdate(
      { numeroCommande: req.params.id },
      { statutCommande },
      { new: true, runValidators: true }
    );

    if (!commande) {
      return res.status(404).json({ 
        success: false,
        message: 'Commande non trouvée' 
      });
    }
    res.status(200).json({
      success: true,
      data: commande
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Erreur de mise à jour',
      error: error.message 
    });
  }
};