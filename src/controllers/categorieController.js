const Categorie = require('../models/Categorie');
const Produit = require('../models/Produit');

// GET all categories with product counts
exports.getCategories = async (req, res) => {
  try {
    const categories = await Categorie.aggregate([
      {
        $lookup: {
          from: 'produits',
          localField: '_id',
          foreignField: 'categorie',
          as: 'produits'
        }
      },
      {
        $addFields: {
          nombreProduits: { $size: '$produits' }
        }
      },
      {
        $project: {
          produits: 0
        }
      }
    ]);

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET single category with associated products
exports.getCategorieById = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id)
      .populate('produits', 'nom prix imageURL quantiteStock');

    if (!categorie) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    res.status(200).json(categorie);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// POST create category (Admin only)
exports.createCategorie = async (req, res) => {
  try {
    const { nomCategorie, descriptionCategorie, typeCategorie, imageCategorie } = req.body;

    // Check for existing category
    const existingCategorie = await Categorie.findOne({ nomCategorie });
    if (existingCategorie) {
      return res.status(409).json({ message: 'Cette catégorie existe déjà' });
    }

    const categorie = new Categorie({
      nomCategorie,
      descriptionCategorie,
      typeCategorie,
      imageCategorie
    });

    await categorie.save();
    res.status(201).json(categorie);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur de validation',
      error: error.message
    });
  }
};

// PUT update category (Admin only)
exports.updateCategorie = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['nomCategorie', 'descriptionCategorie', 'typeCategorie', 'imageCategorie'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Mises à jour non autorisées' });
    }

    const categorie = await Categorie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!categorie) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    res.status(200).json(categorie);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur de mise à jour',
      error: error.message
    });
  }
};

// DELETE category (Admin only)
exports.deleteCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndDelete(req.params.id);
    
    if (!categorie) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    res.status(200).json({ message: 'Catégorie supprimée' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};