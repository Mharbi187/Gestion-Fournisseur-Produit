const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Don't forget to require bcrypt

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true, // Automatically convert to lowercase
    match: [/.+\@.+\..+/, 'Veuillez utiliser un email valide']
  },
  mdp: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['admin', 'client', 'fournisseur'], 
    default: 'client', // Fixed the default value
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
  },
  // OTP fields for email verification
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date,
    purpose: {
      type: String,
      enum: ['verification', 'reset']
    }
  }
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.mdp; // Never send password in responses
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.mdp; // Never send password in responses
      return ret;
    }
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.mdp);
};

module.exports = mongoose.model('User', userSchema);