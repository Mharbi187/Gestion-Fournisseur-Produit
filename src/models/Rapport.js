const mongoose = require('mongoose');

const rapportSchema = new mongoose.Schema({
  typeRapport: { 
    type: String, 
    required: true, 
    enum: ['Rapport de Vente', 'Rapport de Stock', 'Rapport de Livraison', 'Rapport des Clients'], 
    default: 'Rapport de Vente' 
  },
  dategeneration: { 
    type: Date, 
    default: Date.now 
  },
  periode: { 
    type: String, 
    required: true, 
    enum: ['Quotidien', 'Hebdomadaire', 'Mensuel', 'Annuel'], 
    default: 'Mensuel' 
  },
  contenuPDF: { 
    type: String, 
    required: true 
  },
  generePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rapport', rapportSchema);