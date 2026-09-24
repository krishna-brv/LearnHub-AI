const express = require('express');
const router = express.Router();

const questionController = require('../controllers/questionController');
const { protect, optionalAuth } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createQuestionValidator } = require('../validators/questionValidator');

router.get('/quiz/:quizId', optionalAuth, questionController.getQuizQuestions);

// Protected Instructor / Admin Routes
router.use(protect);
router.use(restrictTo('instructor', 'admin'));

router.post('/', createQuestionValidator, validate, questionController.createQuestion);
router.post('/bulk', questionController.bulkCreateQuestions);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;
