const express = require('express');
const router = express.Router();

const courseController = require('../controllers/courseController');
const { protect, optionalAuth } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createCourseValidator, updateCourseValidator } = require('../validators/courseValidator');

// Public / Optional Auth Routes
router.get('/', courseController.getCourses);
router.get('/detail/:slug', optionalAuth, courseController.getCourse);
router.get('/:id', optionalAuth, courseController.getCourse);

// Protected Routes
router.use(protect);

// Reviewer Routes
router.get('/reviewer/queue', restrictTo('reviewer', 'admin'), courseController.getReviewQueue);
router.put('/:id/review', restrictTo('reviewer', 'admin'), courseController.reviewCourse);

// Instructor Routes
router.get('/instructor/my-courses', restrictTo('instructor', 'admin'), courseController.getInstructorCourses);
router.post('/', restrictTo('instructor', 'admin'), createCourseValidator, validate, courseController.createCourse);
router.put('/:id', restrictTo('instructor', 'admin'), updateCourseValidator, validate, courseController.updateCourse);
router.put('/:id/submit', restrictTo('instructor', 'admin'), courseController.submitCourse);
router.put('/:id/publish', restrictTo('reviewer', 'admin'), courseController.publishCourse);
router.put('/:id/archive', restrictTo('instructor', 'admin'), courseController.archiveCourse);
router.post('/:id/announcements', restrictTo('instructor', 'admin'), courseController.sendAnnouncement);
router.delete('/:id', restrictTo('instructor', 'admin'), courseController.deleteCourse);

module.exports = router;
