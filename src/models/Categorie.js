const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema({
  nomCategorie: { 
    type: String, 
    required: [true, 'Le nom de la catégorie est obligatoire'],
    unique: true,
    trim: true,
    maxlength: [50, 'Le nom ne peut excéder 50 caractères']
  },
  descriptionCategorie: { 
    type: String, 
    required: [true, 'La description est obligatoire'],
    trim: true,
    maxlength: [500, 'La description ne peut excéder 500 caractères']
  },
  typeCategorie: { 
    type: String, 
    required: true, 
    enum: {
      values: ['Electronics', 'Clothing', 'Food', 'Furniture'],
      message: 'Type de catégorie non valide'
    }, 
    default: 'Electronics' 
  },
  imageCategorie: { 
    type: String, 
    required: [true, "L'URL de l'image est obligatoire"],
    validate: {
      validator: function(v) {
        return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
      },
      message: 'URL invalide'
    }
  },
  produits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-remove category references from products when deleted
categorieSchema.pre('remove', async function(next) {
  await mongoose.model('Produit').updateMany(
    { categorie: this._id },
    { $unset: { categorie: 1 } }
  );
  next();
});

module.exports = mongoose.model('Categorie', categorieSchema);