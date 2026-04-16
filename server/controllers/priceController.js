const Price = require('../models/Price');
const Product = require('../models/Product');
const Report = require('../models/Report');
const Joi = require('joi');

const createSchema = Joi.object({
  product: Joi.string().required(),
  market: Joi.string().required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.string().default('1')
});

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
      .populate('product', 'name category')
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
    const { error } = createSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const priceData = {
      ...req.body,
      user: req.user._id,
      source: req.user.role === 'merchant' ? 'commercant' : 'citoyen'
    };

    const price = await Price.create(priceData);
    res.status(201).json({ success: true, price });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const { product, market } = req.query;
    const query = { isVerified: true };
    if (product) query.product = product;
    if (market) query.market = market;

    const stats = await Price.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          count: { $sum: 1 }
        }
      }
    ]);

    const byProduct = await Price.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$product',
          avgPrice: { $avg: '$price' },
          count: { $sum: 1 }
        }
      },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', category: '$product.category', avgPrice: 1, count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const byMarket = await Price.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$market',
          avgPrice: { $avg: '$price' },
          count: { $sum: 1 }
        }
      },
      { $lookup: { from: 'markets', localField: '_id', foreignField: '_id', as: 'market' } },
      { $unwind: '$market' },
      { $project: { name: '$market.name', city: '$market.city', avgPrice: 1, count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      stats: stats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0, count: 0 },
      byProduct,
      byMarket
    });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { market, days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = {
      product: productId,
      date: { $gte: startDate },
      isVerified: true
    };
    if (market) query.market = market;

    const history = await Price.find(query)
      .populate('market', 'name city')
      .sort({ date: 1 });

    res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
};

exports.getPending = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const prices = await Price.find({ isVerified: false })
      .populate('product', 'name category')
      .populate('market', 'name city')
      .populate('user', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Price.countDocuments({ isVerified: false });

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

exports.verifyPrice = async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    
    const price = await Price.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    ).populate('product', 'name').populate('market', 'name');

    if (!price) {
      return res.status(404).json({ message: 'Prix non trouvé' });
    }

    res.json({ success: true, price });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const reportsByStatus = await Report.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const reportsByDay = await Report.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const pricesByProduct = await Price.aggregate([
      { $match: { isVerified: true } },
      {
        $group: {
          _id: '$product',
          avgPrice: { $avg: '$price' },
          count: { $sum: 1 }
        }
      },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', avgPrice: 1, count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const pricesByCity = await Price.aggregate([
      { $match: { isVerified: true } },
      { $lookup: { from: 'markets', localField: 'market', foreignField: '_id', as: 'market' } },
      { $unwind: '$market' },
      {
        $group: {
          _id: '$market.city',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      reportsByStatus,
      reportsByDay,
      pricesByProduct,
      pricesByCity
    });
  } catch (error) {
    next(error);
  }
};