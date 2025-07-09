const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nomCategorie: { type: String, required: true },
  descriptionCategorie : { type: String, required: true },
  typeCategorie: { type: String, required: true, enum: ['Electronics', 'Clothing', 'Food', 'Furniture'], default: 'Electronics' },
  imageCategorie: { type: String, required: true },

  
});

module.exports = mongoose.model('Categorie', userSchema);