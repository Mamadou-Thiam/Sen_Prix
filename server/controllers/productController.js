const Product = require('../models/Product');
const Joi = require('joi');

const schema = {
  create: Joi.object({
    name: Joi.string().required(),
    category: Joi.string().valid('riz', 'huile', 'sucre', 'farine', 'lait', 'gaz', 'autre').required(),
    description: Joi.string(),
    unit: Joi.string().valid('kg', 'litre', 'bundle', 'piece'),
    image: Joi.string()
  }),
  update: Joi.object({
    name: Joi.string(),
    category: Joi.string().valid('riz', 'huile', 'sucre', 'farine', 'lait', 'gaz', 'autre'),
    description: Joi.string(),
    unit: Joi.string().valid('kg', 'litre', 'bundle', 'piece'),
    image: Joi.string()
  })
};

exports.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const query = {};
    
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { error } = schema.create.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { error } = schema.update.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.json({ success: true, message: 'Produit supprimé' });
  } catch (error) {
    next(error);
  }
};
