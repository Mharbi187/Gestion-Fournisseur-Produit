const mongoose = require('mongoose');

const alerteStockSchema = new mongoose.Schema({
  produit: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Produit', 
    required: true 
  },
  seuilMinimum: { 
    type: Number, 
    required: true,
    min: 1
  },
  dateAlerte: { 
    type: Date, 
    default: Date.now 
  },
  statutAlerte: { 
    type: String, 
    enum: ['Active', 'Résolue'], 
    default: 'Active' 
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add text index for search
alerteStockSchema.index({
  'produit.nom': 'text',
  statutAlerte: 1,
  dateAlerte: -1
});

module.exports = mongoose.model('AlerteStock', alerteStockSchema);