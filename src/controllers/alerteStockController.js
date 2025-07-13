const AlerteStock = require('../models/AlerteStock'); // Assume this model exists

// GET all stock alerts
exports.getAlertesStock = async (req, res) => {
  try {
    const alertes = await AlerteStock.find().populate('produit', 'nom stock'); // Populate product details
    res.status(200).json(alertes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// GET single alert by ID
exports.getAlerteById = async (req, res) => {
  try {
    const alerte = await AlerteStock.findById(req.params.id).populate('produit');
    if (!alerte) return res.status(404).json({ message: 'Alerte non trouvée' });
    res.status(200).json(alerte);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST create a new alert
exports.createAlerte = async (req, res) => {
  try {
    const { produit, seuilMinimum, message } = req.body;
    if (!produit || !seuilMinimum) {
      return res.status(400).json({ message: 'Produit et seuil minimum requis' });
    }

    const alerte = new AlerteStock({ produit, seuilMinimum, message });
    await alerte.save();
    res.status(201).json(alerte);
  } catch (error) {
    res.status(400).json({ message: 'Erreur de création', error: error.message });
  }
};

// DELETE an alert
exports.deleteAlerte = async (req, res) => {
  try {
    const alerte = await AlerteStock.findByIdAndDelete(req.params.id);
    if (!alerte) return res.status(404).json({ message: 'Alerte non trouvée' });
    res.status(200).json({ message: 'Alerte supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};