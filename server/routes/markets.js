const express = require('express');
const router = express.Router();
const {
  getMarkets,
  getMarket,
  createMarket,
  updateMarket,
  deleteMarket
} = require('../controllers/marketController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getMarkets)
  .post(protect, authorize('admin', 'merchant'), createMarket);

router.route('/:id')
  .get(getMarket)
  .put(protect, authorize('admin', 'merchant'), updateMarket)
  .delete(protect, authorize('admin'), deleteMarket);

module.exports = router;
