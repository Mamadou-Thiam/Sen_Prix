const User = require('../models/User');
const Market = require('../models/Market');
const Joi = require('joi');

const createSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().valid('admin', 'user', 'merchant').required(),
  phone: Joi.string()
});

exports.createUser = async (req, res, next) => {
  try {
    const { error } = createSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password, firstName, lastName, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role,
      phone
    });

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

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
    
    if (!['admin', 'user', 'merchant'].includes(role)) {
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

const updateSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().allow('', null).optional()
});

exports.updateProfile = async (req, res, next) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { firstName, lastName, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone },
      { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (userToDelete._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Product = require('../models/Product');
    const Market = require('../models/Market');
    const Report = require('../models/Report');

    const [userCount, productCount, marketCount, reportCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Market.countDocuments(),
      Report.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        users: userCount,
        products: productCount,
        markets: marketCount,
        reports: reportCount
      }
    });
  } catch (error) {
    next(error);
  }
};
