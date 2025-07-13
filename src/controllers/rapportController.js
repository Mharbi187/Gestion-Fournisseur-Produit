const Rapport = require('../models/Rapport');

// GET all reports
exports.getRapports = async (req, res) => {
  try {
    const rapports = await Rapport.find().sort({ dategeneration: -1 }); // Newest first
    res.status(200).json(rapports);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des rapports',
      error: error.message 
    });
  }
};

// GET single report by ID
exports.getRapportById = async (req, res) => {
  try {
    const rapport = await Rapport.findById(req.params.id);
    if (!rapport) {
      return res.status(404).json({ message: 'Rapport non trouvé' });
    }
    res.status(200).json(rapport);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// POST create new report
exports.createRapport = async (req, res) => {
  try {
    const { typeRapport, periode, contenuPDF } = req.body;

    // Validation
    if (!typeRapport || !periode || !contenuPDF) {
      return res.status(400).json({ 
        message: 'Type, période et contenu PDF sont obligatoires' 
      });
    }

    const rapport = new Rapport({
      typeRapport,
      periode,
      contenuPDF
    });

    await rapport.save();
    res.status(201).json(rapport);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur de création de rapport',
      error: error.message 
    });
  }
};

// PUT update report
exports.updateRapport = async (req, res) => {
  try {
    const { typeRapport, periode, contenuPDF } = req.body;
    const rapport = await Rapport.findByIdAndUpdate(
      req.params.id,
      { typeRapport, periode, contenuPDF },
      { new: true, runValidators: true }
    );

    if (!rapport) {
      return res.status(404).json({ message: 'Rapport non trouvé' });
    }
    res.status(200).json(rapport);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur de mise à jour',
      error: error.message 
    });
  }
};

// DELETE report
exports.deleteRapport = async (req, res) => {
  try {
    const rapport = await Rapport.findByIdAndDelete(req.params.id);
    if (!rapport) {
      return res.status(404).json({ message: 'Rapport non trouvé' });
    }
    res.status(200).json({ message: 'Rapport supprimé' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};