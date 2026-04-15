const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Le nom de l\'entreprise est requis'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Merchant', merchantSchema);