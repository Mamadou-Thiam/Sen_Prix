const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  verifyMerchant,
  updateUserRole,
  assignMarket,
  rateMerchant,
  getStats,
  updateProfile,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', getStats);

router.route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

router.put('/profile', protect, updateProfile);

router.route('/:id')
  .get(protect, getUser)
  .put(protect, authorize('admin'), updateUserRole)
  .delete(protect, authorize('admin'), deleteUser);

router.put('/:id/market', protect, authorize('admin'), assignMarket);
router.post('/:id/rate', protect, rateMerchant);
router.put('/:id/verify', protect, authorize('admin'), verifyMerchant);

module.exports = router;
