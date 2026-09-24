const express = require('express');
const router = express.Router();

const attemptController = require('../controllers/attemptController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');

router.use(protect);

// Student Attempt Engine Routes
router.post('/start/quiz/:quizId', restrictTo('student'), attemptController.startAttempt);
router.put('/:id/answer', restrictTo('student'), attemptController.saveAnswer);
router.post('/:id/submit', restrictTo('student'), attemptController.submitAttempt);
router.get('/history/quiz/:quizId', restrictTo('student'), attemptController.getStudentHistory);
router.get('/:id', attemptController.getAttemptDetails);

module.exports = router;
