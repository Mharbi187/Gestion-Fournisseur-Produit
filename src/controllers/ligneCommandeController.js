const LigneCommande = require('../models/LigneCommande');

// GET all order lines
exports.getLignesCommande = async (req, res) => {
  try {
    const lignes = await LigneCommande.find();
    res.status(200).json(lignes);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des lignes de commande',
      error: error.message 
    });
  }
};

// GET single order line by ID
exports.getLigneCommandeById = async (req, res) => {
  try {
    const ligne = await LigneCommande.findById(req.params.id);
    if (!ligne) {
      return res.status(404).json({ message: 'Ligne de commande non trouvée' });
    }
    res.status(200).json(ligne);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// POST create new order line
exports.createLigneCommande = async (req, res) => {
  try {
    const { quantite, prixUnitaire } = req.body;

    // Validation
    if (!quantite || !prixUnitaire) {
      return res.status(400).json({ 
        message: 'Quantité et prix unitaire sont obligatoires' 
      });
    }

    const ligne = new LigneCommande({
      quantite,
      prixUnitaire
    });

    await ligne.save();
    res.status(201).json(ligne);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur de création de ligne de commande',
      error: error.message 
    });
  }
};

// PUT update order line
exports.updateLigneCommande = async (req, res) => {
  try {
    const { quantite, prixUnitaire } = req.body;
    const ligne = await LigneCommande.findByIdAndUpdate(
      req.params.id,
      { quantite, prixUnitaire },
      { new: true, runValidators: true }
    );

    if (!ligne) {
      return res.status(404).json({ message: 'Ligne de commande non trouvée' });
    }
    res.status(200).json(ligne);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur de mise à jour',
      error: error.message 
    });
  }
};

// DELETE order line
exports.deleteLigneCommande = async (req, res) => {
  try {
    const ligne = await LigneCommande.findByIdAndDelete(req.params.id);
    if (!ligne) {
      return res.status(404).json({ message: 'Ligne de commande non trouvée' });
    }
    res.status(200).json({ message: 'Ligne de commande supprimée' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};