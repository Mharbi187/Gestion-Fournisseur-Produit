const Livraison = require('../models/Livraison');

// GET all deliveries
exports.getLivraisons = async (req, res) => {
  try {
    const livraisons = await Livraison.find().sort({ dateExpedition: -1 }); // Newest first
    res.status(200).json(livraisons);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des livraisons',
      error: error.message 
    });
  }
};

// GET single delivery by ID
exports.getLivraisonById = async (req, res) => {
  try {
    const livraison = await Livraison.findById(req.params.id);
    if (!livraison) {
      return res.status(404).json({ message: 'Livraison non trouvée' });
    }
    res.status(200).json(livraison);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// POST create new delivery
exports.createLivraison = async (req, res) => {
  try {
    const { statutLivraison } = req.body;

    const livraison = new Livraison({
      statutLivraison,
      ...req.body // Spread other fields (notesLivreur, signatureClient etc.)
    });

    await livraison.save();
    res.status(201).json(livraison);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur de création de livraison',
      error: error.message 
    });
  }
};

// PUT update delivery status
exports.updateLivraisonStatus = async (req, res) => {
  try {
    const { statutLivraison, dateLivraisonEffective, notesLivreur } = req.body;
    
    const updateFields = {};
    if (statutLivraison) updateFields.statutLivraison = statutLivraison;
    if (dateLivraisonEffective) updateFields.dateLivraisonEffective = dateLivraisonEffective;
    if (notesLivreur) updateFields.notesLivreur = notesLivreur;

    const livraison = await Livraison.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!livraison) {
      return res.status(404).json({ message: 'Livraison non trouvée' });
    }
    res.status(200).json(livraison);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur de mise à jour',
      error: error.message 
    });
  }
};

// DELETE delivery
exports.deleteLivraison = async (req, res) => {
  try {
    const livraison = await Livraison.findByIdAndDelete(req.params.id);
    if (!livraison) {
      return res.status(404).json({ message: 'Livraison non trouvée' });
    }
    res.status(200).json({ message: 'Livraison supprimée' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};