const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['Electronique', 'Vêtement', 'Alimentation', 'Meuble'], 
    default: 'Electronique',
    required: true
  },
  image: { 
    type: String, 
    required: true 
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Categorie', categorieSchema);