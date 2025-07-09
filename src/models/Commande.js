const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    numeroCommande: { type: String, required: true, unique: true },
    dateCommande: { type: Date, default: Date.now },
    statutCommande: { type: String, required: true, enum: ['En attente', 'Confirmé','En Préparation','Expédiée', 'Livrée', 'Annulée'], default: 'En attente' },
    totalCommande: { type: Number, required: true },
    taxesAppliquees: { type: Number, required: true },
    adresseLivraison: { type: String, required: true },
    modePaiement: { type: String, required: true, enum: ['Carte de crédit', 'PayPal', 'Virement bancaire'], default: 'Carte de crédit' },
    datePaiement: { type: Date, default: Date.now },
    
});

module.exports = mongoose.model('Commande', userSchema);