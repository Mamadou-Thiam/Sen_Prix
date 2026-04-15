const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  verifyMerchant,
  updateUserRole,
  assignMarket,
  rateMerchant,
  getStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', getStats);

router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .get(protect, getUser)
  .put(protect, authorize('admin'), updateUserRole);

router.put('/:id/verify', protect, authorize('admin'), verifyMerchant);
router.put('/:id/market', protect, authorize('admin'), assignMarket);
router.post('/:id/rate', protect, rateMerchant);

module.exports = router;
