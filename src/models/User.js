const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  motdepasse: { type: String, required: true },
  adresse: { type: String, required: true },
  statut: { type: String, required: true, enum: ['Active', 'Inactive', 'Bloqué'], default: 'Active' },
  role: { type: String, required: true, enum: ['Admin', 'User', 'Client', 'Fournisseur'], default: 'Client' },
});

module.exports = mongoose.model('User', userSchema);