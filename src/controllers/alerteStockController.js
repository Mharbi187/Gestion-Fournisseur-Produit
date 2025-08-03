const AlerteStock = require('../models/AlerteStock');
const Produit = require('../models/Produit');

// ADMIN: Get all stock alerts (from document)
exports.getAlertesStock = async (req, res) => {
  try {
    const alertes = await AlerteStock.find()
      .populate('idProduit', 'nom quantiteStock')
      .sort({ dateAlerte: -1 });
    
    res.status(200).json({
      success: true,
      count: alertes.length,
      data: alertes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ADMIN: Resolve alert (from document)
exports.resolveAlerte = async (req, res) => {
  try {
    const alerte = await AlerteStock.findByIdAndUpdate(
      req.params.id,
      { 
        statutAlerte: 'Résolue',
        dateResolution: Date.now(),
        resoluPar: req.user.userId
      },
      { new: true, runValidators: true }
    ).populate('idProduit');
    
    if (!alerte) {
      return res.status(404).json({
        success: false,
        message: 'Alerte non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Alerte résolue avec succès',
      data: alerte
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur de mise à jour',
      error: error.message
    });
  }
};

// Keep existing methods with improved responses
exports.getAlerteById = async (req, res) => {
  try {
    const alerte = await AlerteStock.findById(req.params.id)
      .populate('idProduit');
    
    if (!alerte) {
      return res.status(404).json({
        success: false,
        message: 'Alerte non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: alerte
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

exports.createAlerte = async (req, res) => {
  try {
    const { idProduit, seuilMinimum } = req.body;
    
    // Check if product exists
    const produit = await Produit.findById(idProduit);
    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    const alerte = new AlerteStock({
      idProduit,
      seuilMinimum,
      creePar: req.user.userId
    });
    
    await alerte.save();
    
    res.status(201).json({
      success: true,
      data: alerte
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur de création',
      error: error.message
    });
  }
};

exports.deleteAlerte = async (req, res) => {
  try {
    const alerte = await AlerteStock.findByIdAndDelete(req.params.id);
    
    if (!alerte) {
      return res.status(404).json({
        success: false,
        message: 'Alerte non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Alerte supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};