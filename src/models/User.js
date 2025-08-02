const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  motdepasse: { type: String, required: true },
  adresse: { type: String, required: true },
  statut: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Bloqué'], 
    default: 'Active' 
  },
  role: { 
    type: String, 
    enum: ['Admin', 'User', 'Client', 'Fournisseur'], 
    default: 'User' 
  }
}, { timestamps: true });

// Fixed schema name casing
UserSchema.pre('save', async function(next) {
  if (this.isModified('motdepasse')) {
    this.motdepasse = await bcrypt.hash(this.motdepasse, 10);
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);