const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const schema = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string(),
    role: Joi.string().valid('admin', 'user', 'merchant')
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

exports.register = async (req, res, next) => {
  try {
    const { error } = schema.register.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password, firstName, lastName, phone, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: role || 'user'
    });

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès. Veuillez vous connecter.'
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { error } = schema.login.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        market: user.market
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('market');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};
