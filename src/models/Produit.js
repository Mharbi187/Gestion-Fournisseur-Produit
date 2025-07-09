const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom : { type: String, required: true },
  description : { type: String, required: true },
  prix : { type: Number, required: true },
  quantiteStock : { type: Number, required: true },
  typeProduit : { type: String, required: true, enum: ['Electronics', 'Clothing', 'Food', 'Furniture'], default: 'Electronics' },
  imageURL :{ type: String, required: true },
  dateAjout : { type: Date, default: Date.now },
  statutProduit : { type: String, required: true, enum: ['Disponible', 'En Rupture', 'Archivé'], default: 'Available' },

});

module.exports = mongoose.model('Produit', userSchema);