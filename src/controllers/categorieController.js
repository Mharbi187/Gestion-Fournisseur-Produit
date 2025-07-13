const Categorie = require('../models/Categorie'); // Assume this model exists

// GET all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Categorie.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// GET single category by ID
exports.getCategorieById = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    if (!categorie) return res.status(404).json({ message: 'Catégorie non trouvée' });
    res.status(200).json(categorie);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST create new category
exports.createCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;
    if (!nom) return res.status(400).json({ message: 'Le nom est obligatoire' });

    const categorie = new Categorie({ nom, description });
    await categorie.save();
    res.status(201).json(categorie);
  } catch (error) {
    res.status(400).json({ message: 'Erreur de création', error: error.message });
  }
};

// PUT update category
exports.updateCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;
    const updatedCategorie = await Categorie.findByIdAndUpdate(
      req.params.id,
      { nom, description },
      { new: true } // Returns the updated document
    );
    if (!updatedCategorie) return res.status(404).json({ message: 'Catégorie non trouvée' });
    res.status(200).json(updatedCategorie);
  } catch (error) {
    res.status(400).json({ message: 'Erreur de mise à jour', error: error.message });
  }
};

// DELETE category
exports.deleteCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndDelete(req.params.id);
    if (!categorie) return res.status(404).json({ message: 'Catégorie non trouvée' });
    res.status(200).json({ message: 'Catégorie supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};