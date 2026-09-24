const express = require('express');
const router = express.Router();

const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/conversations', messageController.getConversations);
router.post('/conversations', messageController.createConversation);
router.get('/conversations/:conversationId', messageController.getMessages);
router.post('/conversations/:conversationId/messages', messageController.sendMessage);

module.exports = router;
