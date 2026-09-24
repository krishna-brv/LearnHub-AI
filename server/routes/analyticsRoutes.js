const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');

router.use(protect);

router.get('/admin', restrictTo('admin'), analyticsController.getAdminAnalytics);
router.get('/instructor', restrictTo('instructor', 'admin'), analyticsController.getInstructorAnalytics);

module.exports = router;
