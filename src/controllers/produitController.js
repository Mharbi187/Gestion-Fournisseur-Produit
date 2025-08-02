const Produit = require('../models/Produit');
const { validationResult } = require('express-validator');

// GET all products (public) with pagination
exports.getProduits = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (type) filter.typeProduit = type;
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const produits = await Produit.find(filter)
      .populate('fournisseur', 'nom prenom email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Produit.countDocuments(filter);

    res.status(200).json({
      produits,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des produits',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET single product (public)
exports.getProduitById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de produit invalide' });
    }

    const produit = await Produit.findById(req.params.id)
      .populate('fournisseur', 'nom prenom email');
    
    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    
    res.status(200).json(produit);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération du produit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// POST create product (Fournisseur only)
exports.createProduit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nom, description, prix, quantiteStock, typeProduit, imageURL, seuilAlerte } = req.body;
    
    const produit = new Produit({
      nom,
      description,
      prix,
      quantiteStock,
      seuilAlerte,
      typeProduit,
      imageURL,
      fournisseur: req.user.id
    });

    const savedProduit = await produit.save();
    
    res.status(201).json(savedProduit);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Erreur de validation',
        error: error.message
      });
    }
    res.status(500).json({ 
      message: 'Erreur serveur lors de la création du produit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// PUT update product (Fournisseur owns or Admin)
exports.updateProduit = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de produit invalide' });
    }

    const produit = await Produit.findById(req.params.id);
    
    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Check ownership (Fournisseur) or admin
    if (produit.fournisseur.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['nom', 'description', 'prix', 'quantiteStock', 'typeProduit', 'imageURL', 'seuilAlerte'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Mises à jour non autorisées' });
    }

    updates.forEach(update => produit[update] = req.body[update]);
    await produit.save();

    res.status(200).json(produit);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Erreur de validation',
        error: error.message
      });
    }
    res.status(500).json({ 
      message: 'Erreur serveur lors de la mise à jour du produit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// DELETE product (Fournisseur owns or Admin)
exports.deleteProduit = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de produit invalide' });
    }

    const produit = await Produit.findById(req.params.id);
    
    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Check ownership (Fournisseur) or admin
    if (produit.fournisseur.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    // Soft delete option (better practice)
    // produit.statutProduit = 'Archivé';
    // await produit.save();

    // Or hard delete
    await Produit.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur serveur lors de la suppression du produit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};