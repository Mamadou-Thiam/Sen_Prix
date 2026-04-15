const express = require('express');
const router = express.Router();
const {
  getAlerts,
  markAsRead,
  markAllAsRead,
  deleteAlert,
  getUnreadCount
} = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getAlerts)
  .delete(protect, authorize('admin', 'moderator'), deleteAlert);

router.put('/read/:id', protect, markAsRead);
router.put('/read-all', protect, authorize('admin', 'moderator'), markAllAsRead);
router.get('/unread-count', protect, getUnreadCount);

module.exports = router;
