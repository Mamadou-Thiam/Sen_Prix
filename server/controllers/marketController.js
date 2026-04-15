const Market = require('../models/Market');
const Joi = require('joi');

const schema = {
  create: Joi.object({
    name: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string(),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180)
  }),
  update: Joi.object({
    name: Joi.string(),
    city: Joi.string(),
    address: Joi.string(),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180)
  })
};

exports.getMarkets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, city } = req.query;
    const query = {};
    
    if (city) {
      query.city = city;
    }

    const markets = await Market.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Market.countDocuments(query);

    res.json({
      success: true,
      markets,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
};

exports.getMarket = async (req, res, next) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) {
      return res.status(404).json({ message: 'Marché non trouvé' });
    }
    res.json({ success: true, market });
  } catch (error) {
    next(error);
  }
};

exports.createMarket = async (req, res, next) => {
  try {
    const { error } = schema.create.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, city, address, latitude, longitude } = req.body;
    
    const market = await Market.create({
      name,
      city,
      address,
      location: {
        type: 'Point',
        coordinates: [longitude || 0, latitude || 0]
      }
    });

    res.status(201).json({ success: true, market });
  } catch (error) {
    next(error);
  }
};

exports.updateMarket = async (req, res, next) => {
  try {
    const { error } = schema.update.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { latitude, longitude, ...rest } = req.body;
    const updateData = { ...rest };
    
    if (latitude !== undefined || longitude !== undefined) {
      updateData.location = {
        type: 'Point',
        coordinates: [longitude || 0, latitude || 0]
      };
    }

    const market = await Market.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!market) {
      return res.status(404).json({ message: 'Marché non trouvé' });
    }

    res.json({ success: true, market });
  } catch (error) {
    next(error);
  }
};

exports.deleteMarket = async (req, res, next) => {
  try {
    const market = await Market.findByIdAndDelete(req.params.id);
    if (!market) {
      return res.status(404).json({ message: 'Marché non trouvé' });
    }
    res.json({ success: true, message: 'Marché supprimé' });
  } catch (error) {
    next(error);
  }
};
