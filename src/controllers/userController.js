const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, motdepasse, adresse } = req.body;

    // Validate required fields
    if (!nom || !prenom || !email || !motdepasse) {
      return res.status(400).json({
        success: false,
        message: 'Nom, prénom, email et mot de passe sont requis'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email existe déjà' 
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(motdepasse, 12);
    const user = new User({
      nom,
      prenom,
      email: email.toLowerCase(),
      mdp: hashedPassword, // Store as 'mdp' in database
      role: 'client', // Default role
      adresse
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        adresse: user.adresse
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur de création',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log('Login request body:', req.body); // Debug log
    
    const { email, motdepasse } = req.body; // Accept 'motdepasse' from frontend

    // Validate input
    if (!email || !motdepasse) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+mdp');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Compare passwords - use 'motdepasse' from request, 'mdp' from database
    const isPasswordValid = await bcrypt.compare(motdepasse, user.mdp);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Configuration serveur manquante'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '30d' 
      }
    );

    // Update last login (optional)
    await User.findByIdAndUpdate(user._id, { 
      derniere_connexion: new Date() 
    }, { new: true });

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        adresse: user.adresse
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(500).json({
        success: false,
        message: 'Erreur de génération du token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-mdp');
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// GET single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-mdp');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// POST create user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { nom, prenom, email, mdp, role, adresse } = req.body;

    // Basic validation
    if (!nom || !prenom || !email || !mdp) {
      return res.status(400).json({ 
        success: false,
        message: 'Nom, prénom, email et mot de passe sont requis' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(mdp, 12);

    // Create user
    const user = new User({
      nom,
      prenom,
      email: email.toLowerCase(),
      mdp: hashedPassword,
      role: role || 'client',
      adresse
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.mdp;
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: userResponse
    });

  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Erreur de création', 
      error: error.message 
    });
  }
};

// PUT update user
exports.updateUser = async (req, res) => {
  try {
    const { nom, prenom, adresse, statut, role } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { nom, prenom, adresse, statut, role },
      { 
        new: true,
        runValidators: true
      }
    ).select('-mdp');

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Erreur de mise à jour',
      error: error.message 
    });
  }
};

// DELETE user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Utilisateur supprimé avec succès' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};