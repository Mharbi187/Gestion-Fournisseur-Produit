const Livraison = require('../models/Livraison');
const Commande = require('../models/Commande'); // Needed for client deliveries

// ADMIN: Get all deliveries (from document)
exports.getLivraisons = async (req, res) => {
  try {
    const livraisons = await Livraison.find().sort({ dateExpedition: -1 });
    res.status(200).json({
      success: true,
      data: livraisons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// CLIENT: Get client's deliveries (from document)
exports.getClientLivraisons = async (req, res) => {
  try {
    // First get client's orders
    const commandes = await Commande.find({ client: req.user.userId });
    const commandeIds = commandes.map(c => c._id);
    
    // Then get deliveries for these orders
    const livraisons = await Livraison.find({ commande: { $in: commandeIds } })
      .sort({ dateExpedition: -1 });
    
    res.status(200).json({
      success: true,
      data: livraisons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// FOURNISSEUR: Confirm delivery (from document)
exports.confirmLivraison = async (req, res) => {
  try {
    const { notesLivreur } = req.body;
    
    const livraison = await Livraison.findByIdAndUpdate(
      req.params.id,
      { 
        statutLivraison: 'Livrée',
        dateLivraisonEffective: Date.now(),
        notesLivreur,
        confirmePar: req.user.userId
      },
      { new: true, runValidators: true }
    );

    if (!livraison) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: livraison
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur de confirmation',
      error: error.message
    });
  }
};

// Keep existing methods with improved responses
exports.getLivraisonById = async (req, res) => {
  try {
    const livraison = await Livraison.findById(req.params.id);
    if (!livraison) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }
    res.status(200).json({
      success: true,
      data: livraison
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

exports.createLivraison = async (req, res) => {
  try {
    const livraison = new Livraison(req.body);
    await livraison.save();
    res.status(201).json({
      success: true,
      data: livraison
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur de création',
      error: error.message
    });
  }
};

// ADMIN/FOURNISSEUR: Update delivery status
exports.updateLivraison = async (req, res) => {
  try {
    const { statutLivraison, notesLivreur, dateLivraisonPrevue } = req.body;
    
    const updateData = {};
    if (statutLivraison) updateData.statutLivraison = statutLivraison;
    if (notesLivreur) updateData.notesLivreur = notesLivreur;
    if (dateLivraisonPrevue) updateData.dateLivraisonPrevue = dateLivraisonPrevue;
    
    // If marking as delivered, set effective date
    if (statutLivraison === 'Livrée') {
      updateData.dateLivraisonEffective = Date.now();
    }
    
    const livraison = await Livraison.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!livraison) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: livraison
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur de mise à jour',
      error: error.message
    });
  }
};

exports.deleteLivraison = async (req, res) => {
  try {
    const livraison = await Livraison.findByIdAndDelete(req.params.id);
    if (!livraison) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Livraison supprimée'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};