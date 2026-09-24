const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidator,
  loginValidator,
  verifyOTPValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator
} = require('../validators/authValidator');

// Public Auth Endpoints
router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/verify-email', authLimiter, verifyOTPValidator, validate, authController.verifyEmail);
router.post('/resend-otp', authLimiter, authController.resendOTP);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordValidator, validate, authController.resetPassword);

// Protected Auth Endpoints
router.use(protect);

router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.put('/change-password', changePasswordValidator, validate, authController.changePassword);

module.exports = router;
