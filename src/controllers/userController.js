const User = require('../models/User');

// GET all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-mdp');
    res.status(200).json(users);
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
    res.status(200).json(user);
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
    const { nom, prenom, email, mdp, role } = req.body;

    // Basic validation
    if (!nom || !prenom || !email || !mdp) {
      return res.status(400).json({ 
        success: false,
        message: 'Nom, prénom, email et mot de passe sont requis' 
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Create user
    const user = new User({
      nom,
      prenom,
      email,
      mdp, // Will be hashed by pre-save hook
      role: role || 'client'
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.mdp;
    
    res.status(201).json({
      success: true,
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