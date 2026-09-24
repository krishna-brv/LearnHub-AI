const express = require('express');
const router = express.Router();

const enrollmentController = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { enrollCourseValidator } = require('../validators/enrollmentValidator');

router.use(protect);

// Student Enrollment Routes
router.post('/', restrictTo('student'), enrollCourseValidator, validate, enrollmentController.enroll);
router.get('/my', restrictTo('student', 'instructor', 'admin', 'mentor', 'reviewer'), enrollmentController.getMyEnrollments);
router.delete('/course/:courseId', restrictTo('student'), enrollmentController.unenroll);

// Instructor / Admin Route
router.get('/course/:courseId', restrictTo('instructor', 'admin'), enrollmentController.getCourseEnrollments);

module.exports = router;
