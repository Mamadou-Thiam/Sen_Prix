const User = require('../models/User');
const Market = require('../models/Market');

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const query = {};
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .populate('market', 'name city')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('market', 'name city');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.verifyMerchant = async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'moderator', 'user', 'merchant'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.assignMarket = async (req, res, next) => {
  try {
    const { marketId } = req.body;
    
    const market = await Market.findById(marketId);
    if (!market) {
      return res.status(404).json({ message: 'Marché non trouvé' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { market: marketId },
      { new: true }
    ).select('-password').populate('market', 'name city');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.rateMerchant = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const merchantId = req.params.id;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'La notation doit être entre 1 et 5' });
    }

    const merchant = await User.findById(merchantId);
    if (!merchant || merchant.role !== 'merchant') {
      return res.status(404).json({ message: 'Commerçant non trouvé' });
    }

    const existingRating = merchant.ratings.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingRating) {
      existingRating.rating = rating;
    } else {
      merchant.ratings.push({ user: req.user._id, rating });
    }

    const total = merchant.ratings.reduce((sum, r) => sum + r.rating, 0);
    merchant.averageRating = total / merchant.ratings.length;

    await merchant.save();

    res.json({
      success: true,
      averageRating: merchant.averageRating
    });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Product = require('../models/Product');
    const Market = require('../models/Market');
    const Price = require('../models/Price');

    const [userCount, productCount, marketCount, priceCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Market.countDocuments(),
      Price.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        users: userCount,
        products: productCount,
        markets: marketCount,
        prices: priceCount
      }
    });
  } catch (error) {
    next(error);
  }
};
