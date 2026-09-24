const express = require('express');
const router = express.Router({ mergeParams: true });

const lessonController = require('../controllers/lessonController');
const { protect, optionalAuth } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');
const { checkOwnership } = require('../middleware/ownership');
const validate = require('../middleware/validate');
const Course = require('../models/Course');
const { createLessonValidator, reorderLessonsValidator } = require('../validators/lessonValidator');

// Get lesson details (Public/Preview or Enrolled)
router.get('/:id', optionalAuth, lessonController.getLesson);

// Protected Route — Mark lesson complete (Anyone watching the course)
router.post('/:id/complete', protect, lessonController.completeLesson);

// Protected Instructor Routes
router.use(protect);
router.use(restrictTo('instructor', 'admin'));
router.use(checkOwnership(Course, 'courseId', 'instructor'));

router.get('/', lessonController.getLessons);
router.post('/', createLessonValidator, validate, lessonController.createLesson);
router.put('/reorder', reorderLessonsValidator, validate, lessonController.reorderLessons);
router.put('/:id', lessonController.updateLesson);
router.delete('/:id', lessonController.deleteLesson);

module.exports = router;
