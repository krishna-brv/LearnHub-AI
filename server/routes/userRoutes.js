const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { uploadAvatar } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');
const {
  updateProfileValidator,
  updateRoleValidator,
  updateStatusValidator,
  updateLearningPreferencesValidator
} = require('../validators/userValidator');

// All User routes require authentication
router.use(protect);

// Current User Profile Endpoints
router.get('/profile', userController.getProfile);
router.get('/me', userController.getProfile);
router.put('/profile', updateProfileValidator, validate, userController.updateProfile);
router.put('/profile/photo', uploadLimiter, uploadAvatar, userController.updateAvatar);
router.put('/learning-preferences', updateLearningPreferencesValidator, validate, userController.updateLearningPreferences);

// Platform Admin User Management Endpoints
router.get('/', restrictTo('admin'), userController.getAllUsers);
router.get('/:id', restrictTo('admin'), userController.getUserById);
router.put('/:id/role', restrictTo('admin'), updateRoleValidator, validate, userController.updateUserRole);
router.put('/:id/status', restrictTo('admin'), updateStatusValidator, validate, userController.updateUserStatus);
router.delete('/:id', restrictTo('admin'), userController.deleteUser);

module.exports = router;
