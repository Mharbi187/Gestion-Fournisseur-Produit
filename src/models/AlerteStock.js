const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    idProduit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
    seuilMinimum: { type: Number, required: true },
    dateAlerte: { type: Date, default: Date.now },
    statutAlerte: { type: String, required: true, enum: ['Active', 'Résolue'], default: 'Active' },
  
});

module.exports = mongoose.model('AlerteStock', userSchema);