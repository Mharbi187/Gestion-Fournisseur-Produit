const bcrypt = require('bcrypt');
const User = require('../models/User');

// Hash password utility
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// GET all users (exclude passwords)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-motdepasse');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// GET single user by ID (exclude password)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-motdepasse');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST create user (with password hashing)
exports.createUser = async (req, res) => {
  try {
    const { nom, prenom, email, motdepasse, adresse, statut, role } = req.body;

    // Validation
    if (!nom || !prenom || !email || !motdepasse || !adresse) {
      return res.status(400).json({ message: 'Tous les champs requis doivent être fournis' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email existe déjà' });
    }

    // Hash password
    const hashedPassword = await hashPassword(motdepasse);

    // Create user
    const user = new User({
      nom,
      prenom,
      email,
      motdepasse: hashedPassword,
      adresse,
      statut: statut || 'Active',
      role: role || 'User',
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.motdepasse;
    res.status(201).json(userResponse);

  } catch (error) {
    res.status(400).json({ message: 'Erreur de création', error: error.message });
  }
};

// PUT update user (exclude password updates)
exports.updateUser = async (req, res) => {
  try {
    const { nom, prenom, adresse, statut, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { nom, prenom, adresse, statut, role },
      { new: true, runValidators: true }  // Critical options
    ).select('-motdepasse');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur de mise à jour',
      error: error.message 
    });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.status(200).json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};