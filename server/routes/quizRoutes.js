const express = require('express');
const router = express.Router();

const quizController = require('../controllers/quizController');
const { protect, optionalAuth } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createQuizValidator, updateQuizValidator } = require('../validators/quizValidator');

// Public / Optional Auth Route
router.get('/course/:courseId', optionalAuth, quizController.getCourseQuizzes);
router.get('/:id', optionalAuth, quizController.getQuiz);

// Protected Instructor / Admin Routes
router.use(protect);
router.use(restrictTo('instructor', 'admin'));

router.post('/', createQuizValidator, validate, quizController.createQuiz);
router.put('/:id', updateQuizValidator, validate, quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);

module.exports = router;
