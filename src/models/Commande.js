const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
  numeroCommande: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `CMD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`
  },
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fournisseur: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  produits: [{
    produit: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Produit',
      required: true
    },
    quantite: {
      type: Number,
      required: true,
      min: 1
    },
    prixUnitaire: {
      type: Number,
      required: true
    }
  }],
  statutCommande: { 
    type: String, 
    enum: ['En attente', 'Confirmée', 'En préparation', 'Expédiée', 'Livrée', 'Annulée'], 
    default: 'En attente' 
  },
  totalCommande: { 
    type: Number, 
    required: true,
    min: 0
  },
  taxesAppliquees: { 
    type: Number, 
    default: 0,
    min: 0
  },
  adresseLivraison: { 
    type: String, 
    required: true 
  },
  modePaiement: { 
    type: String, 
    enum: ['Carte de crédit', 'PayPal', 'Virement bancaire'], 
    default: 'Carte de crédit' 
  },
  datePaiement: { 
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-calculate total before save
commandeSchema.pre('save', function(next) {
  if (this.isModified('produits')) {
    this.totalCommande = this.produits.reduce(
      (total, item) => total + (item.prixUnitaire * item.quantite), 0);
  }
  next();
});

module.exports = mongoose.model('Commande', commandeSchema);