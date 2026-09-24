const express = require('express');
const router = express.Router();

const submissionController = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { uploadAssignmentFiles } = require('../middleware/upload');
const { gradeSubmissionValidator } = require('../validators/assignmentValidator');

router.use(protect);

// Student Routes
router.post('/assignment/:assignmentId', restrictTo('student'), uploadAssignmentFiles, submissionController.submitAssignment);
router.get('/my', restrictTo('student'), submissionController.getMySubmissions);

// Instructor / Mentor Routes
router.get('/assignment/:assignmentId', restrictTo('instructor', 'mentor', 'admin'), submissionController.getAssignmentSubmissions);
router.put('/:id/grade', restrictTo('instructor', 'mentor', 'admin'), gradeSubmissionValidator, validate, submissionController.gradeSubmission);

module.exports = router;
