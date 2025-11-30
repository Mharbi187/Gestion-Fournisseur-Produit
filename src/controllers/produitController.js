const Produit = require('../models/Produit');

// GET all products with pagination, filtering, sorting, and search (public)
exports.getProduits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = 'createdAt',
      order = 'desc',
      minPrice,
      maxPrice
    } = req.query;

    // Build query
    let query = {};
    
    // Category filter
    if (category && category !== 'all') {
      query.categorie = category;
    }
    
    // Search filter (name or description)
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.prix = {};
      if (minPrice) query.prix.$gte = Number(minPrice);
      if (maxPrice) query.prix.$lte = Number(maxPrice);
    }

    // Build sort object
    const sortOptions = {};
    switch (sort) {
      case 'price-low':
        sortOptions.prix = 1;
        break;
      case 'price-high':
        sortOptions.prix = -1;
        break;
      case 'name-az':
        sortOptions.nom = 1;
        break;
      case 'name-za':
        sortOptions.nom = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination info
    const total = await Produit.countDocuments(query);
    
    // Fetch products with pagination
    const produits = await Produit.find(query)
      .populate('categorie', 'nom _id')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    
    res.status(200).json({
      success: true,
      count: produits.length,
      total,
      page: pageNum,
      totalPages,
      hasNextPage,
      hasPrevPage,
      data: produits
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
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