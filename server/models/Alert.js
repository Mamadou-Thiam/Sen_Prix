const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['high_price', 'suspicious_variation', 'penurie'],
    required: [true, 'Le type d\'alerte est requis']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market'
  },
  message: {
    type: String,
    required: [true, 'Le message est requis']
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);
