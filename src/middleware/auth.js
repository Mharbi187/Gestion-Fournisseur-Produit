const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = '30d';

// User Registration
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, mdp, role = 'client' } = req.body;

    // Validate required fields
    if (!email || !mdp) {
      return res.status(400).json({ 
        success: false,
        message: 'Email et mot de passe sont requis' 
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email déjà utilisé'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(mdp, 12);

    // Create user
    const user = new User({
      nom,
      prenom,
      email,
      mdp: hashedPassword,
      role
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );

    // Return response without password
    const userResponse = user.toObject();
    delete userResponse.mdp;

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
      expiresIn: '30d'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, mdp } = req.body;

    // Validate input
    if (!email || !mdp) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis'
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+mdp');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(mdp, user.mdp);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );

    // Return response without password
    const userResponse = user.toObject();
    delete userResponse.mdp;

    res.json({
      success: true,
      token,
      user: userResponse,
      expiresIn: '30d'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// JWT Authentication Middleware
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token manquant'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }
    
    req.user = decoded;
    next();
  });
};

// Role Authorization Middleware
exports.authorizedRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès interdit: Rôle ${req.user.role} non autorisé`
      });
    }
    next();
  };
};