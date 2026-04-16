const express = require('express');
const router = express.Router();
const {
  getReports,
  getReport,
  createReport,
  updateReportStatus,
  markAsRead,
  deleteReport,
  getUnreadCount
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/unread-count', protect, authorize('admin'), getUnreadCount);

router.route('/')
  .get(protect, authorize('admin'), getReports)
  .post(protect, createReport);

router.route('/:id')
  .get(protect, authorize('admin'), getReport)
  .put(protect, authorize('admin'), updateReportStatus)
  .delete(protect, authorize('admin'), deleteReport);

router.put('/:id/read', protect, authorize('admin'), markAsRead);

module.exports = router;
