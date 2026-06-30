require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Market = require('./models/Market');
const User = require('./models/User');
const Price = require('./models/Price');
const connectDB = require('./config/db');

const seedPrices = async () => {
  try {
    await connectDB();

    const products = await Product.find({ category: { $in: ['riz', 'huile', 'sucre', 'farine', 'lait', 'gaz'] } });
    const markets = await Market.find({
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    });

    if (products.length === 0 || markets.length === 0) {
      console.error('Exécutez d\'abord node seed.js pour créer les produits et marchés');
      process.exit(1);
    }

    let testUser = await User.findOne({ email: 'test@senprix.sn' });
    if (!testUser) {
      testUser = await User.create({
        email: 'test@senprix.sn',
        password: 'test123456',
        firstName: 'Test',
        lastName: 'Utilisateur',
        role: 'user',
        isVerified: true
      });
      console.log('Utilisateur de test créé: test@senprix.sn / test123456');
    }

    await Price.deleteMany({});

    const variationProfiles = {
      'Marché Sandaga': { riz: 12, huile: 8, sucre: 5, farine: 3, lait: 10, gaz: 2 },
      'Marché Kermesse': { riz: 8, huile: 5, sucre: 3, farine: 2, lait: 6, gaz: 1 },
      'Marché Tilène_Dakar': { riz: 5, huile: 3, sucre: 2, farine: 1, lait: 4, gaz: 0 },
      'Marché HLM': { riz: 2, huile: 4, sucre: 1, farine: 0, lait: 3, gaz: 0 },
      'Marché Tilène_Saint-Louis': { riz: 15, huile: 10, sucre: 8, farine: 5, lait: 12, gaz: 3 },
      'Marché Sor': { riz: 18, huile: 12, sucre: 10, farine: 7, lait: 15, gaz: 5 },
      'Marché Ndoulo': { riz: 8, huile: 6, sucre: 4, farine: 2, lait: 7, gaz: 1 },
      'Marché Touba': { riz: 25, huile: 20, sucre: 15, farine: 10, lait: 18, gaz: 8 },
      'Marché Mbour': { riz: 6, huile: 4, sucre: 3, farine: 1, lait: 5, gaz: 0 },
      'Marché Kaolack': { riz: 10, huile: 7, sucre: 5, farine: 3, lait: 8, gaz: 2 },
      'Marché Ziguinchor': { riz: 20, huile: 15, sucre: 12, farine: 8, lait: 14, gaz: 4 },
      'Marché Louga': { riz: 7, huile: 5, sucre: 3, farine: 2, lait: 6, gaz: 1 },
      'Marché Diourbel': { riz: 9, huile: 6, sucre: 4, farine: 2, lait: 7, gaz: 1 },
      'Marché Tambacounda': { riz: 30, huile: 25, sucre: 20, farine: 15, lait: 22, gaz: 10 },
    };

    const categoryToKey = {
      riz: 'riz',
      huile: 'huile',
      sucre: 'sucre',
      farine: 'farine',
      lait: 'lait',
      gaz: 'gaz'
    };

    const prices = [];
    let priceCount = 0;

    for (const market of markets) {
      const marketName = market.name;
      const profileKey = markets.filter(m => m.name === marketName).length > 1
        ? `${marketName}_${market.city.replace(/\s/g, '')}`
        : marketName;

      const profile = variationProfiles[profileKey] || variationProfiles[marketName] || { riz: 5, huile: 3, sucre: 2, farine: 1, lait: 4, gaz: 0 };

      for (const product of products) {
        const catKey = categoryToKey[product.category] || 'riz';
        let variationPct = profile[catKey] ?? 5;

        variationPct += (Math.random() - 0.5) * 4;
        variationPct = Math.max(0, Math.round(variationPct * 10) / 10);

        const numReports = variationPct > 0 ? Math.floor(Math.random() * 5) + 1 : 0;

        for (let i = 0; i < numReports; i++) {
          const dayOffset = Math.floor(Math.random() * 14);
          const reportDate = new Date();
          reportDate.setDate(reportDate.getDate() - dayOffset);

          const baseOfficial = product.price;
          const reportedPrice = Math.round(baseOfficial * (1 + variationPct / 100) * (1 + (Math.random() - 0.5) * 0.05));

            prices.push({
              product: product._id,
              market: market._id,
              user: testUser._id,
            price: reportedPrice,
            quantity: '1',
            date: reportDate,
            source: Math.random() > 0.3 ? 'citoyen' : 'commercant',
            isVerified: true
          });
          priceCount++;
        }
      }
    }

    await Price.insertMany(prices);
    console.log(`${priceCount} prix de test créés avec succès`);
    console.log('\nÉcarts simulés par marché:');
    for (const [key, profile] of Object.entries(variationProfiles)) {
      const displayKey = key.replace(/_/g, ' - ');
      const maxVar = Math.max(...Object.values(profile));
      const marker = maxVar <= 5 ? '🟢' : maxVar <= 15 ? '🟡' : maxVar <= 30 ? '🟠' : '🔴';
      console.log(`  ${marker} ${displayKey}: +${maxVar}% max`);
    }

    process.exit(0);
  } catch (error) {
    console.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
};

seedPrices();
