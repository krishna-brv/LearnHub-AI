const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const courseRoutes = require('./courseRoutes');
const moduleRoutes = require('./moduleRoutes');
const lessonRoutes = require('./lessonRoutes');
const enrollmentRoutes = require('./enrollmentRoutes');
const progressRoutes = require('./progressRoutes');
const quizRoutes = require('./quizRoutes');
const questionRoutes = require('./questionRoutes');
const attemptRoutes = require('./attemptRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const submissionRoutes = require('./submissionRoutes');
const certificateRoutes = require('./certificateRoutes');
const mentorRoutes = require('./mentorRoutes');
const discussionRoutes = require('./discussionRoutes');
const notificationRoutes = require('./notificationRoutes');
const messageRoutes = require('./messageRoutes');
const gamificationRoutes = require('./gamificationRoutes');
const portfolioRoutes = require('./portfolioRoutes');
const noteRoutes = require('./noteRoutes');
const skillRoutes = require('./skillRoutes');
const bookmarkRoutes = require('./bookmarkRoutes');
const aiRoutes = require('./aiRoutes');
const analyticsRoutes = require('./analyticsRoutes');

/**
 * Root REST API Router Aggregator
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to LearnHub AI Complete REST API Server',
    version: '1.0.0',
    tagline: 'Learn Smarter. Practice Better. Grow Faster.',
    documentation: '/api/health'
  });
});

// Mount All Module Routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/courses', courseRoutes);
router.use('/courses/:courseId/modules', moduleRoutes);
router.use('/courses/:courseId/modules/:moduleId/lessons', lessonRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/progress', progressRoutes);
router.use('/quizzes', quizRoutes);
router.use('/questions', questionRoutes);
router.use('/attempts', attemptRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/submissions', submissionRoutes);
router.use('/certificates', certificateRoutes);
router.use('/mentors', mentorRoutes);
router.use('/discussions', discussionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/messages', messageRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/notes', noteRoutes);
router.use('/skills', skillRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
