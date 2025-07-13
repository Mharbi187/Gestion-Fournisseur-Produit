const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/users - Create a new user
router.post('/', async (req, res) => {
  try {
    const { nom, prenom, email, motdepasse, adresse, statut, role } = req.body;

    // Validate required fields
    if (!nom || !prenom || !email || !motdepasse || !adresse) {
      return res.status(400).json({ message: 'Tous les champs requis doivent être fournis' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email existe déjà' });
    }

    // Create new user (plain-text password)
    const user = new User({
      nom,
      prenom,
      email,
      motdepasse, // No hashing
      adresse,
      statut: statut || 'Active', // Default to 'Active'
      role: role || 'User', // Default to 'User'
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
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;