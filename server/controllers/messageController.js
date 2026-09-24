const asyncHandler = require('../middleware/asyncHandler');
const messageService = require('../services/messageService');
const { successResponse } = require('../utils/apiResponse');

exports.getConversations = asyncHandler(async (req, res) => {
  const conversations = await messageService.getUserConversations(req.user._id);
  return successResponse(res, 'Conversations fetched', { conversations });
});

exports.createConversation = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  const conversation = await messageService.findOrCreateConversation(req.user._id, recipientId);
  return successResponse(res, 'Conversation created/retrieved', { conversation }, 201);
});

exports.getMessages = asyncHandler(async (req, res) => {
  const result = await messageService.getMessages(req.params.conversationId, req.user._id, req.query);
  return successResponse(res, 'Messages fetched', { messages: result.messages }, 200, result.pagination);
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const { content, attachments } = req.body;
  const message = await messageService.sendMessage(req.user._id, req.params.conversationId, content, attachments);
  return successResponse(res, 'Message sent', { message }, 201);
});
