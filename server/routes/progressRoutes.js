const express = require('express');
const router = express.Router();

const progressController = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Progress Routes (Accessible by anyone watching courses: student, instructor, mentor, admin, reviewer)
router.get('/overview', progressController.getOverview);
router.get('/heatmap', progressController.getHeatmap);
router.get('/streak', progressController.getStreak);
router.get('/study-time', progressController.getStudyTime);
router.get('/course/:courseId', progressController.getCourseProgress);
router.post('/complete-lesson', progressController.completeLesson);

module.exports = router;
