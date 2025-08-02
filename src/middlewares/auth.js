const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, motdepasse } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(motdepasse, user.motdepasse))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (user.statut !== 'Active') {
      return res.status(403).json({ message: 'Compte désactivé. Contactez l\'administrateur' });
    }

    res.json({
      _id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      token: generateToken(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { nom, prenom, email, motdepasse, adresse } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(motdepasse, salt);

    // Create user
    const user = await User.create({
      nom,
      prenom,
      email,
      motdepasse: hashedPassword,
      adresse,
      statut: 'Active',
      role: 'User' // Default role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        token: generateToken(user)
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du compte' });
  }
};

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      req.user = await User.findById(decoded.id).select('-motdepasse');
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Session expirée. Veuillez vous reconnecter' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Non autorisé, token manquant' });
  }
};

// Role-based authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Rôle ${req.user.role} non autorisé à accéder à cette ressource` 
      });
    }
    next();
  };
};