const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du marché est requis'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'La ville est requise'],
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Market', marketSchema);
