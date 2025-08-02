const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Utility function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Authentication: User Registration
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, motdepasse, adresse } = req.body;

    // Check if user exists (case insensitive)
    const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(motdepasse, salt);

    // Create user with 'client' role by default
    const user = await User.create({
      nom,
      prenom,
      email: email.toLowerCase(),
      motdepasse: hashedPassword,
      adresse,
      statut: 'Active',
      role: 'client'
    });

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.motdepasse;

    res.status(201).json({
      ...userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création du compte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Authentication: User Login
exports.login = async (req, res) => {
  try {
    const { email, motdepasse } = req.body;

    // Find user with password
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
                          .select('+motdepasse +statut');

    // Check credentials
    if (!user || !(await bcrypt.compare(motdepasse, user.motdepasse))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Check account status
    if (user.statut !== 'Active') {
      return res.status(403).json({ message: 'Compte désactivé' });
    }

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.motdepasse;

    res.json({
      ...userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Erreur du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
exports.getUsers = async (req, res) => {
  try {
    // Only allow admins
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const users = await User.find().select('-motdepasse');
    res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin or self
exports.getUserById = async (req, res) => {
  try {
    // Allow admin or the user themselves
    if (req.user.role !== 'Admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const user = await User.findById(req.params.id).select('-motdepasse');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Create user (admin only)
// @route   POST /api/users
// @access  Admin
exports.createUser = async (req, res) => {
  try {
    // Only allow admins
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { nom, prenom, email, motdepasse, adresse, role } = req.body;

    // Validate input
    if (!nom || !prenom || !email || !motdepasse || !adresse || !role) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(motdepasse, salt);

    // Create user
    const user = new User({
      nom,
      prenom,
      email,
      motdepasse: hashedPassword,
      adresse,
      role,
      statut: 'Active'
    });

    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.motdepasse;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      message: 'Erreur de création',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin or self
exports.updateUser = async (req, res) => {
  try {
    // Allow admin or the user themselves
    if (req.user.role !== 'Admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Prevent role/status modification by non-admins
    if (req.user.role !== 'Admin' && (req.body.role || req.body.statut)) {
      return res.status(403).json({ message: 'Modification non autorisée' });
    }

    // Handle password update separately
    if (req.body.motdepasse) {
      const salt = await bcrypt.genSalt(10);
      req.body.motdepasse = await bcrypt.hash(req.body.motdepasse, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-motdepasse');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      message: 'Erreur de mise à jour',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUser = async (req, res) => {
  try {
    // Only allow admins
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};