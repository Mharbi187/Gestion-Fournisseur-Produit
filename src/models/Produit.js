const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String, required: true },
  prix: { type: Number, required: true, min: 0 },
  quantiteStock: { 
    type: Number, 
    required: true, 
    min: 0,
    validate: {
      validator: function(value) {
        if (value === 0) this.statutProduit = 'En Rupture';
        return true;
      }
    }
  },
  seuilAlerte: {  // ← REQUIRED FIELD ADDED
    type: Number,
    default: 10,
    min: 1
  },
  typeProduit: { 
    type: String, 
    required: true, 
    enum: ['Electronics', 'Clothing', 'Food', 'Furniture'], 
    default: 'Electronics' 
  },
  imageURL: { type: String, required: true },
  dateAjout: { type: Date, default: Date.now },
  statutProduit: { 
    type: String, 
    enum: ['Disponible', 'En Rupture', 'Archivé'], 
    default: 'Disponible' 
  },
  fournisseur: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  alertesActivees: {  // ← NEW FIELD TO TRACK ALERT STATE
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

produitSchema.pre('save', async function(next) {
  if (this.isModified('quantiteStock')) {
    // Auto-update product status
    if (this.quantiteStock === 0) {
      this.statutProduit = 'En Rupture';
    } else if (this.statutProduit === 'En Rupture') {
      this.statutProduit = 'Disponible';
    }

    // Stock alert logic
    if (this.quantiteStock < this.seuilAlerte && !this.alertesActivees) {
      try {
        const AlerteStock = require('./AlerteStock');
        const existingAlert = await AlerteStock.findOne({
          produit: this._id,
          statutAlerte: 'Active'
        });

        if (!existingAlert) {
          await AlerteStock.create({
            produit: this._id,
            seuilMinimum: this.seuilAlerte
          });

          const User = require('./User');
          const fournisseur = await User.findById(this.fournisseur);
          if (fournisseur) {
            const emailService = require('../services/emailService');
            await emailService.sendStockAlert(
              fournisseur.email,
              this.nom,
              this.quantiteStock,
              this.seuilAlerte
            );
          }
        }

        this.alertesActivees = true;
      } catch (err) {
        console.error('Failed to create stock alert:', err);
        // Continue save even if alert fails
      }
    } else if (this.quantiteStock >= this.seuilAlerte) {
      this.alertesActivees = false;
    }
  }
  next();
});

module.exports = mongoose.model('Produit', produitSchema);