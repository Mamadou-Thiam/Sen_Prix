const Price = require('../models/Price');
const Product = require('../models/Product');
const Market = require('../models/Market');
const Alert = require('../models/Alert');
const Joi = require('joi');

const schema = {
  create: Joi.object({
    product: Joi.string().required(),
    market: Joi.string().required(),
    price: Joi.number().min(0).required(),
    quantity: Joi.string(),
    date: Joi.date()
  })
};

const checkPriceAlerts = async (productId, marketId, newPrice) => {
  const lastPrice = await Price.findOne({
    product: productId,
    market: marketId
  }).sort({ date: -1 });

  if (lastPrice) {
    const variation = ((newPrice - lastPrice.price) / lastPrice.price) * 100;
    
    if (variation > 20) {
      const product = await Product.findById(productId);
      const market = await Market.findById(marketId);
      
      await Alert.create({
        type: 'suspicious_variation',
        product: productId,
        market: marketId,
        message: `Variation suspecte de ${variation.toFixed(1)}% pour ${product?.name} à ${market?.name}`
      });
    }
  }

  const avgPrice = await Price.aggregate([
    { $match: { product: productId, isVerified: true } },
    { $group: { _id: null, avg: { $avg: '$price' } } }
  ]);

  if (avgPrice.length > 0 && newPrice > avgPrice[0].avg * 1.5) {
    const product = await Product.findById(productId);
    const market = await Market.findById(marketId);
    
    await Alert.create({
      type: 'high_price',
      product: productId,
      market: marketId,
      message: `Prix élevé détecté pour ${product?.name} à ${market?.name} (${newPrice} vs moyenne: ${avgPrice[0].avg.toFixed(2)})`
    });
  }
};

exports.getPrices = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, product, market, startDate, endDate } = req.query;
    const query = {};
    
    if (product) query.product = product;
    if (market) query.market = market;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const prices = await Price.find(query)
      .populate('product', 'name category unit')
      .populate('market', 'name city')
      .populate('user', 'firstName lastName')
      .populate('merchant', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const count = await Price.countDocuments(query);

    res.json({
      success: true,
      prices,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
};

exports.createPrice = async (req, res, next) => {
  try {
    const { error } = schema.create.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { product, market, price, quantity, date } = req.body;
    
    const priceData = {
      product,
      market,
      user: req.user._id,
      price,
      quantity: quantity || '1',
      date: date ? new Date(date) : new Date()
    };

    if (req.user.role === 'merchant') {
      priceData.merchant = req.user._id;
      priceData.isVerified = true;
    }

    const newPrice = await Price.create(priceData);
    
    await checkPriceAlerts(product, market, price);

    const populatedPrice = await Price.findById(newPrice._id)
      .populate('product', 'name category unit')
      .populate('market', 'name city')
      .populate('user', 'firstName lastName');

    res.status(201).json({ success: true, price: populatedPrice });
  } catch (error) {
    next(error);
  }
};

exports.getPriceStats = async (req, res, next) => {
  try {
    const { product, market } = req.query;
    const match = { isVerified: true };
    
    if (product) match.product = product;
    if (market) match.market = market;

    const stats = await Price.aggregate([
      { $match: match },
      {
        $group: {
          _id: { product: '$product', market: '$market' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $lookup: {
          from: 'markets',
          localField: '_id.market',
          foreignField: '_id',
          as: 'market'
        }
      },
      { $unwind: '$product' },
      { $unwind: '$market' },
      {
        $project: {
          productName: '$product.name',
          productCategory: '$product.category',
          marketName: '$market.name',
          marketCity: '$market.city',
          avgPrice: 1,
          minPrice: 1,
          maxPrice: 1,
          count: 1
        }
      }
    ]);

    const globalStats = await Price.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          globalAvg: { $avg: '$price' },
          totalPrices: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats,
      global: globalStats[0] || { globalAvg: 0, totalPrices: 0 }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPriceHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { market, days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const match = {
      product: productId,
      date: { $gte: startDate },
      isVerified: true
    };
    
    if (market) match.market = market;

    const history = await Price.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          avgPrice: { $avg: '$price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
};

exports.getPendingPrices = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const prices = await Price.find({ isVerified: false })
      .populate('product', 'name category unit')
      .populate('market', 'name city')
      .populate('user', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const count = await Price.countDocuments({ isVerified: false });

    res.json({
      success: true,
      prices,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPrice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const price = await Price.findById(id);
    if (!price) {
      return res.status(404).json({ message: 'Prix non trouvé' });
    }

    price.isVerified = isVerified;
    await price.save();

    res.json({
      success: true,
      price: await Price.findById(id)
        .populate('product', 'name category unit')
        .populate('market', 'name city')
        .populate('user', 'firstName lastName')
    });
  } catch (error) {
    next(error);
  }
};
