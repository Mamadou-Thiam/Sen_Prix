const Report = require('../models/Report');
const Alert = require('../models/Alert');
const Joi = require('joi');

const schema = {
  create: Joi.object({
    type: Joi.string().valid('price_incorrect', 'product_quality', 'merchant_behavior', 'fake_product', 'other').required(),
    description: Joi.string(),
    product: Joi.string().required(),
    market: Joi.string().required(),
    price: Joi.number().min(0).required(),
    quantity: Joi.string().default('1'),
    reporterRole: Joi.string().valid('user', 'merchant').required()
  }),
  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'verified', 'rejected').required()
  })
};

exports.getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('product', 'name category')
      .populate('market', 'name city')
      .populate('reportedBy', 'firstName lastName email role')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Report.countDocuments(query);

    res.json({
      success: true,
      reports,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
};

exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('product', 'name category price')
      .populate('market', 'name city')
      .populate('reportedBy', 'firstName lastName email');

    if (!report) {
      return res.status(404).json({ message: 'Signalement non trouvé' });
    }
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

exports.createReport = async (req, res, next) => {
  try {
    const { error } = schema.create.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const reportData = {
      ...req.body,
      reportedBy: req.user._id
    };

    const report = await Report.create(reportData);
    res.status(201).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

exports.updateReportStatus = async (req, res, next) => {
  try {
    const { error } = schema.updateStatus.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const report = await Report.findById(req.params.id)
      .populate('product', 'name category')
      .populate('market', 'name city')
      .populate('reportedBy', 'firstName lastName email');

    if (!report) {
      return res.status(404).json({ message: 'Signalement non trouvé' });
    }

    if (req.body.status === 'verified') {
      await Alert.create({
        type: 'high_price',
        product: report.product._id,
        market: report.market._id,
        message: `Prix signalé: ${report.product.name} au marché ${report.market.name} à ${report.price} CFA (signalé par ${report.reportedBy.firstName} ${report.reportedBy.lastName})`
      });
    }

    report.status = req.body.status;
    await report.save();

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Signalement non trouvé' });
    }
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Signalement non trouvé' });
    }
    res.json({ success: true, message: 'Signalement supprimé' });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Report.countDocuments({ isRead: false });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};
