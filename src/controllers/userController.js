const bcrypt = require('bcrypt');
const User = require('../models/User');

// Hash password before saving (alternative: use a pre-save hook in the model)
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Get all users (exclude passwords)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-motdepasse');
    res.status(200).json({ message: 'Utilisateurs récupérés avec succès', users });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Create a new user (with password hashing)
const createUser = async (req, res) => {
  const { nom, prenom, email, motdepasse, adresse, statut, role } = req.body;

  try {
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
      motdepasse: hashedPassword, // Store hashed password
      adresse,
      statut: statut || 'Active',
      role: role || 'User',
    });

    await user.save();

    // Return user without password
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        adresse: user.adresse,
        statut: user.statut,
        role: user.role,
        _id: user._id,
      },
    });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error: error.message });
  }
};

module.exports = { getUsers, createUser };