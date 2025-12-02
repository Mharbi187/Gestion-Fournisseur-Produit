const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
    numeroCommande: { 
      type: String, 
      unique: true,
      default: function() {
        return 'CMD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
      }
    },
    client: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    produits: [{
      produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
      quantite: { type: Number, required: true, min: 1 },
      prixUnitaire: { type: Number, required: true }
    }],
    dateCommande: { type: Date, default: Date.now },
    statutCommande: { 
      type: String, 
      enum: ['en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee', 'En attente', 'Confirmé', 'En Préparation', 'Expédiée', 'Livrée', 'Annulée'], 
      default: 'en_attente' 
    },
    montantTotal: { type: Number, required: true },
    totalCommande: { type: Number }, // Legacy field
    taxesAppliquees: { type: Number, default: 0 },
    fraisLivraison: { type: Number, default: 7 },
    adresseLivraison: { type: String, required: true },
    
    // Payment fields
    statutPaiement: {
      type: String,
      enum: ['en_attente', 'paye', 'echoue', 'rembourse'],
      default: 'en_attente'
    },
    methodePaiement: { 
      type: String, 
      enum: ['carte', 'especes', 'Carte de crédit', 'PayPal', 'Virement bancaire'], 
      default: 'carte' 
    },
    stripePaymentId: { type: String },
    datePaiement: { type: Date },
    
    notes: { type: String }
}, {
    timestamps: true
});

// Index for faster queries
commandeSchema.index({ client: 1, createdAt: -1 });
commandeSchema.index({ stripePaymentId: 1 });

module.exports = mongoose.model('Commande', commandeSchema);