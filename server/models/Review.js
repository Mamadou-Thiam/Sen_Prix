const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  comment: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: [true, 'Le marchand est requis']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est requis']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);