const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/.+\@.+\..+/, 'Veuillez utiliser un email valide']
  },
  mdp: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['admin', 'client', 'fournisseur'], 
    default: 'client',
    required: true
  },
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: String
  },
  statut: {
    type: String,
    enum: ['Actif', 'Inactif'],
    default: 'Actif'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


module.exports = mongoose.model('User', userSchema);