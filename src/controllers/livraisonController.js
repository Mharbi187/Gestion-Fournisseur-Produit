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
    // Get livraisons directly by client ID
    let livraisons = await Livraison.find({ client: req.user.userId })
      .populate('commande')
      .sort({ createdAt: -1 });
    
    // If no livraisons found by client, try via commandes
    if (livraisons.length === 0) {
      const commandes = await Commande.find({ client: req.user.userId });
      const commandeIds = commandes.map(c => c._id);
      
      livraisons = await Livraison.find({ commande: { $in: commandeIds } })
        .populate('commande')
        .sort({ createdAt: -1 });
    }
    
    // Transform data to include all needed fields
    const enrichedLivraisons = livraisons.map(l => ({
      _id: l._id,
      id: l._id,
      commande: l.commande?._id || l.commande,
      numeroCommande: l.commande?.numeroCommande,
      statut: l.statutLivraison,
      status: l.statutLivraison,
      adresse: l.adresse || l.commande?.adresseLivraison || '-',
      address: l.adresse || l.commande?.adresseLivraison || '-',
      montant: l.commande?.montantTotal || 0,
      dateExpedition: l.dateExpedition,
      dateLivraisonPrevue: l.dateLivraisonPrevue,
      dateLivraisonEffective: l.dateLivraisonEffective,
      transporteur: l.transporteur || 'LIVRINI Express',
      createdAt: l.createdAt,
      updatedAt: l.updatedAt
    }));
    
    res.status(200).json({
      success: true,
      data: enrichedLivraisons
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
    const { id } = req.params;
    let livraison = null;
    
    // Check if id is a valid MongoDB ObjectId
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) {
      livraison = await Livraison.findById(id).populate('commande');
    }
    
    // If not found by _id, try by commande reference
    if (!livraison) {
      livraison = await Livraison.findOne({ commande: id }).populate('commande');
    }
    
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