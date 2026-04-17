const Alert = require('../models/Alert');

exports.getAlerts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const query = {};
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const alerts = await Alert.find(query)
      .populate('product', 'name')
      .populate('market', 'name city')
      .populate('user', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Alert.countDocuments(query);
    const unreadCount = await Alert.countDocuments({ ...query, isRead: false });

    res.json({
      success: true,
      alerts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const alert = await Alert.findOneAndUpdate(
      query,
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alerte non trouvée' });
    }

    res.json({ success: true, alert });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const query = { isRead: false };
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    await Alert.updateMany(
      query,
      { isRead: true }
    );

    res.json({ success: true, message: 'Toutes les alertes marquées comme lues' });
  } catch (error) {
    next(error);
  }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alerte non trouvée' });
    }
    res.json({ success: true, message: 'Alerte supprimée' });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Alert.countDocuments({ isRead: false });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};
