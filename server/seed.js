require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Market = require('./models/Market');
const User = require('./models/User');
const connectDB = require('./config/db');

const products = [
  { 
    name: 'Riz brisé ordinaire importé', 
    category: 'riz', 
    description: 'Riz brisé ordinaire importé - Prix officiel État', 
    unit: 'kg',
    price: 300
  },
  { 
    name: 'Riz brisé non parfumé', 
    category: 'riz', 
    description: 'Riz brisé non parfumé local ou importé', 
    unit: 'kg',
    price: 350
  },
  { 
    name: 'Huile de palme raffinée', 
    category: 'huile', 
    description: 'Huile de palme raffinée - Prix officiel État', 
    unit: 'litre',
    price: 1000
  },
  { 
    name: 'Sucre cristallisé', 
    category: 'sucre', 
    description: 'Sucre cristallisé blanc - Prix officiel État', 
    unit: 'kg',
    price: 600
  },
  { 
    name: 'Pain baguette 190g', 
    category: 'autre', 
    description: 'Pain baguette 190g - Prix officiel État', 
    unit: 'piece',
    price: 150
  },
  { 
    name: 'Farine de blé type 55', 
    category: 'farine', 
    description: 'Farine de blé boulanger type 55 pour pain', 
    unit: 'kg',
    price: 304
  },
  { 
    name: 'Ciment logement social', 
    category: 'autre', 
    description: 'Ciment pour logement social - Prix officiel État', 
    unit: 'piece',
    price: 3550
  },
  { 
    name: 'Lait en poudre', 
    category: 'lait', 
    description: 'Lait en poudre importé', 
    unit: 'kg',
    price: 1500
  },
  { 
    name: 'Gaz butane 6kg', 
    category: 'gaz', 
    description: 'Bouteille de gaz butane 6kg', 
    unit: 'piece',
    price: 4500
  },
  { 
    name: 'Gaz butane 12kg', 
    category: 'gaz', 
    description: 'Bouteille de gaz butane 12kg', 
    unit: 'piece',
    price: 8500
  }
];

const markets = [
  { name: 'Marché Sandaga', city: 'Dakar', address: 'Avenue du Président Lamine Senghor', latitude: 14.6928, longitude: -17.4467 },
  { name: 'Marché Kermesse', city: 'Dakar', address: 'Point E', latitude: 14.6792, longitude: -17.4621 },
  { name: 'Marché Tilène', city: 'Dakar', address: 'Quartier Tilène', latitude: 14.6500, longitude: -17.4300 },
  { name: 'Marché HLM', city: 'Dakar', address: 'HLM', latitude: 14.7200, longitude: -17.4500 },
  { name: 'Marché Tilène', city: 'Saint-Louis', address: 'Quartier Thiébakh', latitude: 16.0503, longitude: -16.5075 },
  { name: 'Marché Sor', city: 'Saint-Louis', address: 'Quartier Sor', latitude: 16.0278, longitude: -16.4819 },
  { name: 'Marché Ndoulo', city: 'Thiès', address: 'Centre ville', latitude: 14.7931, longitude: -16.9279 },
  { name: 'Marché Touba', city: 'Touba', address: 'Quartier Darou Minane', latitude: 14.8333, longitude: -15.8833 },
  { name: 'Marché Mbour', city: 'Mbour', address: 'Quartier Djembe', latitude: 14.3794, longitude: -16.9639 },
  { name: 'Marché Kaolack', city: 'Kaolack', address: 'Centre ville', latitude: 14.1342, longitude: -16.0764 },
  { name: 'Marché Ziguinchor', city: 'Ziguinchor', address: 'Quartier Boucotte', latitude: 12.5667, longitude: -16.2833 },
  { name: 'Marché Louga', city: 'Louga', address: 'Centre ville', latitude: 15.6167, longitude: -16.2333 },
  { name: 'Marché Diourbel', city: 'Diourbel', address: 'Centre ville', latitude: 14.6500, longitude: -16.2333 },
  { name: 'Marché Tambacounda', city: 'Tambacounda', address: 'Centre ville', latitude: 13.7667, longitude: -13.6667 },
  { name: 'Marché Kaolack', city: 'Kaolack', address: 'Grand marché', latitude: 14.1342, longitude: -16.0764 }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Market.deleteMany({});
    await Product.insertMany(products);
    await Market.insertMany(markets);
    console.log('Données seeded avec succès - Prix officiels du Sénégal 2026');
    console.log('\nPrix homologués:');
    products.forEach(p => console.log(`- ${p.name}: ${p.price} FCFA/${p.unit}`));
    process.exit(0);
  } catch (error) {
    console.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
