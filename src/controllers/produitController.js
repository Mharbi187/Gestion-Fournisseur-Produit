const Produit = require('../models/Produit');

// GET all products
exports.getProduits = async (req, res) => {
  try {
    const produits = await Produit.find();
    res.status(200).json(produits);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// GET single product by ID
exports.getProduitById = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
    res.status(200).json(produit);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST create new product
exports.createProduit = async (req, res) => {
  try {
    const { nom, prix, stock } = req.body;
    if (!nom || !prix) return res.status(400).json({ message: 'Nom et prix requis' });

    const produit = new Produit({ nom, prix, stock });
    await produit.save();
    res.status(201).json(produit);
  } catch (error) {
    res.status(400).json({ message: 'Erreur de création', error: error.message });
  }
};