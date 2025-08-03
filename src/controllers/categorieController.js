const Categorie = require('../models/Categorie');

// GET all categories (public)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Categorie.find().populate('createdBy', 'nom prenom');
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// GET single category (public)
exports.getCategorieById = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id).populate('createdBy', 'nom prenom');
    if (!categorie) {
      return res.status(404).json({ 
        success: false,
        message: 'Catégorie non trouvée' 
      });
    }
    res.status(200).json({
      success: true,
      data: categorie
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// POST create category (admin only)
exports.createCategorie = async (req, res) => {
  try {
    const { nom, description, type, image } = req.body;

    if (!nom || !description || !type || !image) {
      return res.status(400).json({ 
        success: false,
        message: 'Tous les champs sont obligatoires' 
      });
    }

    const existingCategorie = await Categorie.findOne({ nom });
    if (existingCategorie) {
      return res.status(400).json({ 
        success: false,
        message: 'Cette catégorie existe déjà' 
      });
    }

    const categorie = new Categorie({
      nom,
      description,
      type,
      image,
      createdBy: req.user.userId // From auth middleware
    });

    await categorie.save();

    res.status(201).json({
      success: true,
      data: categorie
    });

  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Erreur de création', 
      error: error.message 
    });
  }
};

// PUT update category (admin only)
exports.updateCategorie = async (req, res) => {
  try {
    const { nom, description, type, image } = req.body;

    const updatedCategorie = await Categorie.findByIdAndUpdate(
      req.params.id,
      { nom, description, type, image },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedCategorie) {
      return res.status(404).json({ 
        success: false,
        message: 'Catégorie non trouvée' 
      });
    }

    res.status(200).json({
      success: true,
      data: updatedCategorie
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Erreur de mise à jour',
      error: error.message 
    });
  }
};

// DELETE category (admin only)
exports.deleteCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndDelete(req.params.id);
    
    if (!categorie) {
      return res.status(404).json({ 
        success: false,
        message: 'Catégorie non trouvée' 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Catégorie supprimée avec succès' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};