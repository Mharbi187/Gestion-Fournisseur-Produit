const mongoose = require('mongoose');

const livraisonSchema = new mongoose.Schema({
  commande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande',
    required: true
  },
  livreur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dateExpedition: {
    type: Date,
    default: null
  },
  dateLivraisonPrevue: {
    type: Date,
    required: true
  },
  dateLivraisonEffective: {
    type: Date,
    default: null
  },
  statutLivraison: {
    type: String,
    enum: ['En préparation', 'Expédiée', 'En transit', 'Livrée', 'Retardée'],
    default: 'En préparation'
  },
  notesLivreur: String,
  signatureClient: String,
  adresseLivraison: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-update expedition date when status changes to "Expédiée"
livraisonSchema.pre('save', function(next) {
  if (this.isModified('statutLivraison') && this.statutLivraison === 'Expédiée') {
    this.dateExpedition = new Date();
  }
  next();
});

module.exports = mongoose.model('Livraison', livraisonSchema);