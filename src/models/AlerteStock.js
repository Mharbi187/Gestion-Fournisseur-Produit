const mongoose = require('mongoose');

const alerteStockSchema = new mongoose.Schema({
  idProduit: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Produit', 
    required: true 
  },
  seuilMinimum: { 
    type: Number, 
    required: true,
    min: 0
  },
  dateAlerte: { 
    type: Date, 
    default: Date.now 
  },
  statutAlerte: { 
    type: String, 
    enum: ['Active', 'Résolue'], 
    default: 'Active',
    required: true
  },
  dateResolution: { 
    type: Date 
  },
  creePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resoluPar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AlerteStock', alerteStockSchema);