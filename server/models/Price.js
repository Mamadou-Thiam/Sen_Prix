const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Le produit est requis']
  },
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: [true, 'Le marché est requis']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est requis']
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: 0
  },
  quantity: {
    type: String,
    default: '1'
  },
  date: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['citoyen', 'commercant'],
    default: 'citoyen'
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

priceSchema.index({ product: 1, market: 1, date: -1 });

module.exports = mongoose.model('Price', priceSchema);
