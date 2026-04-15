const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true
  },
  category: {
    type: String,
    enum: ['riz', 'huile', 'sucre', 'farine', 'lait', 'gaz', 'autre'],
    required: [true, 'La catégorie est requise']
  },
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    enum: ['kg', 'litre', 'bundle', 'piece'],
    default: 'kg'
  },
  image: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
