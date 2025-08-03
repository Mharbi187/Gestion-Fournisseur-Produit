const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = '30d'; // Changed to 30 days

// User registration
exports.register = async (email, mdp, role = 'client') => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(mdp, 10);
    const user = new User({ email, mdp: hashedPassword, role });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION } // Using 30-day expiration
    );

    return { 
      token, 
      userId: user._id,
      expiresIn: '30 days' // Explicitly tell client the expiration
    };
  } catch (error) {
    throw error;
  }
};

// User login
exports.login = async (email, mdp) => {
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Utilisateur non trouvé');

    const isMatch = await bcrypt.compare(mdp, user.mdp);
    if (!isMatch) throw new Error('Mot de passe incorrect');

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION } // Using 30-day expiration
    );

    return { 
      token, 
      userId: user._id, 
      role: user.role,
      expiresIn: '30 days' // Explicitly tell client the expiration
    };
  } catch (error) {
    throw error;
  }
};

// Token verification middleware (unchanged)
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token manquant' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalide' });
    req.user = user;
    next();
  });
};

// Role authorization middleware (unchanged)
exports.authorizedRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Accès interdit: Rôle ${req.user.role} non autorisé` 
      });
    }
    next();
  };
};          