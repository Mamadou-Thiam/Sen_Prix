require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Market = require('./models/Market');
const User = require('./models/User');
const connectDB = require('./config/db');

const products = [
  { name: 'Riz importé', category: 'riz', description: 'Riz importé de qualité', unit: 'kg' },
  { name: 'Riz local', category: 'riz', description: 'Riz produit localement', unit: 'kg' },
  { name: 'Huile de palme', category: 'huile', description: 'Huile de palme raffinée', unit: 'litre' },
  { name: 'Huile d\'arachide', category: 'huile', description: 'Huile d\'arachide artisanale', unit: 'litre' },
  { name: 'Sucre en poudre', category: 'sucre', description: 'Sucre blanc raffiné', unit: 'kg' },
  { name: 'Sucre cristallisé', category: 'sucre', description: 'Sucre cristallisé local', unit: 'kg' },
  { name: 'Farine de blé', category: 'farine', description: 'Farine de blé tamisée', unit: 'kg' },
  { name: 'Farine de mil', category: 'farine', description: 'Farine de mil locale', unit: 'kg' },
  { name: 'Lait en poudre', category: 'lait', description: 'Lait en poudre instantané', unit: 'kg' },
  { name: 'Lait frais', category: 'lait', description: 'Lait frais local', unit: 'litre' },
  { name: 'Gaz butane 6kg', category: 'gaz', description: 'Bouteille de gaz butane 6kg', unit: 'piece' },
  { name: 'Gaz butane 12kg', category: 'gaz', description: 'Bouteille de gaz butane 12kg', unit: 'piece' }
];

const markets = [
  { name: 'Marché Sandaga', city: 'Dakar', address: 'Avenue du Président Lamine Senghor', latitude: 14.6928, longitude: -17.4467 },
  { name: 'Marché Kermesse', city: 'Dakar', address: 'Point E', latitude: 14.6792, longitude: -17.4621 },
  { name: 'Marché Thiaroye', city: 'Dakar', address: 'Thiaroye', latitude: 14.7282, longitude: -17.3956 },
  { name: 'Marché Tilène', city: 'Saint-Louis', address: 'Quartier Thiébakh', latitude: 16.0503, longitude: -16.5075 },
  { name: 'Marché Azinga', city: 'Saint-Louis', address: 'Quartier Sor', latitude: 16.0278, longitude: -16.4819 },
  { name: 'Marché Ndoulo', city: 'Thiès', address: 'Centre ville', latitude: 14.7931, longitude: -16.9279 },
  { name: 'Marché Touba', city: 'Touba', address: 'Quartier Darou Minane', latitude: 14.8333, longitude: -15.8833 },
  { name: 'Marché Mbour', city: 'Mbour', address: 'Quartier Djembe', latitude: 14.3794, longitude: -16.9639 },
  { name: 'Marché Kaolack', city: 'Kaolack', address: 'Centre ville', latitude: 14.1342, longitude: -16.0764 },
  { name: 'Marché Ziguinchor', city: 'Ziguinchor', address: 'Quartier Boucotte', latitude: 12.5667, longitude: -16.2833 }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Market.deleteMany({});
    await Product.insertMany(products);
    await Market.insertMany(markets);
    console.log('Données seeded avec succès');
    process.exit(0);
  } catch (error) {
    console.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
