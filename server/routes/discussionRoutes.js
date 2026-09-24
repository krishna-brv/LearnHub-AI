const express = require('express');
const router = express.Router();

const discussionController = require('../controllers/discussionController');
const { protect, optionalAuth } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');

router.get('/', optionalAuth, discussionController.getDiscussions);
router.get('/course/:courseId', optionalAuth, discussionController.getDiscussions);
router.get('/:id', optionalAuth, discussionController.getDiscussion);

router.use(protect);

router.post('/', discussionController.createDiscussion);
router.post('/course/:courseId', discussionController.createDiscussion);
router.post('/:id/upvote', discussionController.toggleUpvote);
router.post('/:id/comments', discussionController.addComment);
router.put('/comments/:commentId/answer', restrictTo('instructor', 'admin'), discussionController.markAnswer);

module.exports = router;
