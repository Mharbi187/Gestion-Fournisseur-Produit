const AlerteStock = require('../models/AlerteStock');
const Produit = require('../models/Produit');
const User = require('../models/User');
const { sendAlertEmail } = require('../services/emailService'); // Assume email service exists

// GET all stock alerts (filterable)
exports.getAlertesStock = async (req, res) => {
  try {
    const { status, search, sort } = req.query;
    const filter = {};
    
    if (status) filter.statutAlerte = status;
    if (search) {
      filter.$or = [
        { 'produit.nom': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {
      newest: { dateAlerte: -1 },
      oldest: { dateAlerte: 1 },
      critical: { seuilMinimum: 1 }
    };

    const alertes = await AlerteStock.find(filter)
      .populate('produit', 'nom quantiteStock prix imageURL')
      .populate('resolvedBy', 'nom prenom')
      .sort(sortOptions[sort] || sortOptions.newest);

    res.status(200).json(alertes);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET single alert by ID
exports.getAlerteById = async (req, res) => {
  try {
    const alerte = await AlerteStock.findById(req.params.id)
      .populate('produit')
      .populate('resolvedBy', 'nom prenom');

    if (!alerte) {
      return res.status(404).json({ message: 'Alerte non trouvée' });
    }

    res.status(200).json(alerte);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// POST create alert (auto-triggered by product updates)
exports.createAlerte = async (req, res) => {
  try {
    const { produitId, seuilMinimum } = req.body;

    const produit = await Produit.findById(produitId);
    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Check if active alert already exists
    const existingAlert = await AlerteStock.findOne({ 
      produit: produitId,
      statutAlerte: 'Active'
    });

    if (existingAlert) {
      return res.status(409).json({ 
        message: 'Alerte active existe déjà pour ce produit'
      });
    }

    const alerte = new AlerteStock({
      produit: produitId,
      seuilMinimum: seuilMinimum || produit.seuilAlerte
    });

    await alerte.save();
    
    // Send notification
    await sendAlertEmail(produit, alerte);

    res.status(201).json(alerte);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur de création',
      error: error.message
    });
  }
};

// PUT resolve alert (admin/fournisseur)
exports.resolveAlerte = async (req, res) => {
  try {
    const { notes } = req.body;
    const alerte = await AlerteStock.findById(req.params.id);

    if (!alerte) {
      return res.status(404).json({ message: 'Alerte non trouvée' });
    }

    if (alerte.statutAlerte === 'Résolue') {
      return res.status(400).json({ message: 'Alerte déjà résolue' });
    }

    const updatedAlerte = await AlerteStock.findByIdAndUpdate(
      req.params.id,
      {
        statutAlerte: 'Résolue',
        resolvedBy: req.user.id,
        resolvedAt: new Date(),
        notes
      },
      { new: true }
    );

    res.status(200).json(updatedAlerte);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur de mise à jour',
      error: error.message
    });
  }
};

// DELETE alert (admin only)
exports.deleteAlerte = async (req, res) => {
  try {
    const alerte = await AlerteStock.findByIdAndDelete(req.params.id);
    
    if (!alerte) {
      return res.status(404).json({ message: 'Alerte non trouvée' });
    }
    
    res.status(200).json({ message: 'Alerte supprimée' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};