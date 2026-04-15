const express = require('express');
const router = express.Router();
const {
  getPrices,
  createPrice,
  getPriceStats,
  getPriceHistory,
  getPendingPrices,
  verifyPrice
} = require('../controllers/priceController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getPrices)
  .post(protect, createPrice);

router.get('/stats', getPriceStats);
router.get('/history/:productId', getPriceHistory);

router.get('/pending', protect, authorize('admin', 'moderator'), getPendingPrices);
router.put('/verify/:id', protect, authorize('admin', 'moderator'), verifyPrice);

module.exports = router;
