const express = require('express');
const router = express.Router();

const mentorController = require('../controllers/mentorController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');

router.use(protect);

// Admin Route
router.post('/assign', restrictTo('admin'), mentorController.assignMentor);
router.get('/course-assignments', restrictTo('admin', 'mentor', 'student'), mentorController.getCourseAssignments);

// Mentor Routes
router.get('/mentees', restrictTo('mentor', 'admin'), mentorController.getAssignedMentees);
router.get('/mentees/:studentId/progress', restrictTo('mentor', 'admin'), mentorController.getMenteeProgress);
router.post('/sessions', restrictTo('mentor', 'student', 'admin'), mentorController.scheduleSession);
router.put('/sessions/:sessionId/link', restrictTo('mentor', 'admin'), mentorController.updateSessionMeetingLink);
router.get('/courses/:courseId/mentor-chat', mentorController.getCourseMentorAndConversation);
router.get('/sessions/upcoming', mentorController.getUpcomingSessions);
router.get('/goals', mentorController.getGoals);
router.post('/mentees/:studentId/goals', restrictTo('mentor', 'admin'), mentorController.createGoal);
router.put('/goals/:goalId/progress', restrictTo('mentor', 'admin'), mentorController.updateGoalProgress);
router.post('/mentees/:studentId/feedback', restrictTo('mentor', 'admin'), mentorController.addFeedback);

module.exports = router;
