const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  prix: { 
    type: Number, 
    required: true,
    min: 0
  },
  quantiteStock: { 
    type: Number, 
    required: true,
    min: 0,
    default: 0
  },
  categorie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categorie',
    required: true
  },
  fournisseur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageURL: { 
    type: String, 
    required: true 
  },
  statutProduit: { 
    type: String, 
    enum: ['Disponible', 'En Rupture', 'Archivé'], 
    default: 'Disponible'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Produit', produitSchema);