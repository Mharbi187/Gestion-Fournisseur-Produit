const Produit = require('../models/Produit');

// GET all products (public)
exports.getProduits = async (req, res) => {
  try {
    const produits = await Produit.find();
    res.status(200).json({
      success: true,
      data: produits
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// GET single product (public)
exports.getProduitById = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) {
      return res.status(404).json({ 
        success: false,
        message: 'Produit non trouvé' 
      });
    }
    res.status(200).json({
      success: true,
      data: produit
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// POST create product (fournisseur only)
exports.createProduit = async (req, res) => {
  try {
    const { nom, description, prix, quantiteStock, typeProduit, imageURL, statutProduit } = req.body;

    // Add fournisseur ID from JWT token
    const produit = new Produit({
      nom,
      description,
      prix,
      quantiteStock,
      typeProduit,
      imageURL,
      statutProduit,
      fournisseur: req.user.userId // Added from JWT
    });

    await produit.save();

    res.status(201).json({
      success: true,
      data: produit
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Erreur de création', 
      error: error.message 
    });
  }
};

// PUT update product (fournisseur only)
exports.updateProduit = async (req, res) => {
  try {
    // First verify the product belongs to this fournisseur
    const produit = await Produit.findOne({
      _id: req.params.id,
      fournisseur: req.user.userId
    });

    if (!produit) {
      return res.status(403).json({ 
        success: false,
        message: 'Non autorisé à modifier ce produit' 
      });
    }

    const updatedProduit = await Produit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProduit
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Erreur de mise à jour',
      error: error.message 
    });
  }
};

// DELETE product (fournisseur only)
exports.deleteProduit = async (req, res) => {
  try {
    // First verify the product belongs to this fournisseur
    const produit = await Produit.findOne({
      _id: req.params.id,
      fournisseur: req.user.userId
    });

    if (!produit) {
      return res.status(403).json({ 
        success: false,
        message: 'Non autorisé à supprimer ce produit' 
      });
    }

    await Produit.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ 
      success: true,
      message: 'Produit supprimé avec succès' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};