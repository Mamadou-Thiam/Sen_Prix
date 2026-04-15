const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Trop de tentatives de connexion, veuillez réessayer plus tard'
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.get('/me', protect, getMe);

module.exports = router;
