const express = require('express');
const router = express.Router();
const {
  getPrices,
  createPrice,
  getStats,
  getHistory,
  getPending,
  verifyPrice,
  getDashboardStats
} = require('../controllers/priceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/dashboard-stats', protect, authorize('admin'), getDashboardStats);

router.route('/')
  .get(protect, getPrices)
  .post(protect, createPrice);

router.get('/pending', protect, authorize('admin'), getPending);

router.get('/history/:productId', protect, getHistory);

router.put('/verify/:id', protect, authorize('admin'), verifyPrice);

module.exports = router;