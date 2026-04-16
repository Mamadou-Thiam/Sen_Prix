const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['price_incorrect', 'product_quality', 'merchant_behavior', 'fake_product', 'other'],
    required: [true, 'Le type de signalement est requis']
  },
  description: {
    type: String,
    trim: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis']
  },
  quantity: {
    type: String,
    default: '1'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reporterRole: {
    type: String,
    enum: ['user', 'merchant'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
