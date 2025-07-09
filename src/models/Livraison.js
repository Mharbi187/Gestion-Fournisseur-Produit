const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    dateExpedition: { type: Date, default: Date.now },
    dateLivraisonPrevue: { type: Date, default: Date.now },
    dateLivraisonEffective: { type: Date, default: Date.now },
    statutLivraison: { type: String, required: true, enum: ['En Transit','Livrée', 'En Attente'], default: 'En attente' },
    notesLivreur: { type: String, default: '' },
    signatureClient: { type: String, default: '' },

  
});

module.exports = mongoose.model('Livraison', userSchema);