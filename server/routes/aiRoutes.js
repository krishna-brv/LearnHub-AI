const express = require('express');
const router = express.Router();

const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.use(aiLimiter); // Enforce 50 requests/hour rate limit on all AI routes

// 1. AI Tutor Routes
router.post('/tutor/chat', aiController.tutorChat);
router.get('/tutor/conversations', aiController.getTutorConversations);
router.get('/tutor/conversations/:conversationId', aiController.getTutorMessages);

// 2. AI Learning Path Routes
router.post('/learning-path/generate', restrictTo('student'), aiController.generateLearningPath);
router.get('/learning-path/active', restrictTo('student'), aiController.getActiveLearningPath);

// 3. AI Quiz Generator (Students, Instructors & Admin)
router.post('/quiz-generator/generate', restrictTo('student', 'instructor', 'admin'), aiController.generateQuizQuestions);

// 4. AI Weakness & Risk Detection
router.get('/weakness/analyze', restrictTo('student'), aiController.analyzeWeakness);
router.get('/at-risk/course/:courseId', restrictTo('instructor', 'admin'), aiController.getAtRiskStudents);

// 5. AI Career Advisor
router.get('/career/guidance', restrictTo('student'), aiController.getCareerGuidance);
router.post('/career/guidance', restrictTo('student'), aiController.getCareerGuidance);

// 6. AI Resume Analyzer
router.post('/resume/analyze', restrictTo('student'), aiController.analyzeResume);

// 7. AI Mock Interview
router.post('/interview/start', restrictTo('student'), aiController.startInterview);
router.post('/interview/:sessionId/evaluate', restrictTo('student'), aiController.evaluateInterviewAnswer);

// 8. AI Smart Notes
router.post('/smart-notes/generate', aiController.generateSmartNote);

// 9. AI Flashcard Generator
router.post('/flashcards/generate', aiController.generateFlashcards);

module.exports = router;
