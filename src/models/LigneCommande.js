const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    quantite: { type: Number, required: true },
    prixUnitaire: { type: Number, required: true },

  
});

module.exports = mongoose.model('LigneCommande', userSchema);