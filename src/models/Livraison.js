const mongoose = require('mongoose');

const livraisonSchema = new mongoose.Schema({
    commande: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Commande',
      required: true 
    },
    client: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    },
    adresse: { type: String },
    dateExpedition: { type: Date, default: Date.now },
    dateLivraisonPrevue: { type: Date, default: Date.now },
    dateLivraisonEffective: { type: Date },
    statutLivraison: { 
      type: String, 
      required: true, 
      enum: ['En Transit', 'Livrée', 'En Attente'], 
      default: 'En Attente' 
    },
    notesLivreur: { type: String, default: '' },
    signatureClient: { type: String, default: '' },
    transporteur: { type: String, default: 'LIVRINI Express' }
}, {
    timestamps: true
});

// Index for faster queries
livraisonSchema.index({ client: 1 });
livraisonSchema.index({ commande: 1 });

module.exports = mongoose.model('Livraison', livraisonSchema);