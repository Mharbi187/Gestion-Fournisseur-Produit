const User = require('../models/User');

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-motdepasse');
    res.status(200).json({ message: 'Utilisateurs récupérés avec succès', users });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Create a new user
const createUser = async (req, res) => {
  const { nom, prenom, email, motdepasse, adresse, statut, role } = req.body;

  try {
    if (!nom || !prenom || !email || !motdepasse || !adresse) {
      return res.status(400).json({ message: 'Tous les champs requis doivent être fournis' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email existe déjà' });
    }

    const user = new User({
      nom,
      prenom,
      email,
      motdepasse, // Plain-text password
      adresse,
      statut: statut || 'Active',
      role: role || 'User',
    });

    await user.save();
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