const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { getIO } = require('../config/socket');

class MessageService {
  /**
   * Get User Conversations
   */
  async getUserConversations(userId) {
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'firstName lastName profile.avatar role username')
      .sort({ updatedAt: -1 })
      .lean();

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: userId },
          'readBy.user': { $ne: userId },
          isDeleted: false
        });
        return {
          ...conv,
          unreadCount
        };
      })
    );

    return conversationsWithUnread;
  }

  /**
   * Find or Create Direct Conversation
   */
  async findOrCreateConversation(userId1, userId2) {
    if (!userId1 || !userId2) {
      throw new AppError('Participants are required.', 400);
    }

    if (userId1.toString() === userId2.toString()) {
      let conversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: [userId1] }
      }).populate('participants', 'firstName lastName profile.avatar role');

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [userId1],
          type: 'direct',
          createdBy: userId1
        });
        conversation = await Conversation.findById(conversation._id).populate('participants', 'firstName lastName profile.avatar role');
      }
      return conversation;
    }

    let conversation = await Conversation.findOne({
      type: 'direct',
      participants: { $all: [userId1, userId2] }
    }).populate('participants', 'firstName lastName profile.avatar role');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId1, userId2],
        type: 'direct',
        createdBy: userId1
      });
      conversation = await Conversation.findById(conversation._id).populate('participants', 'firstName lastName profile.avatar role');
    }

    return conversation;
  }

  /**
   * Get Messages in Conversation
   */
  async getMessages(conversationId, userId, queryParams) {
    const { page = 1, limit = 30 } = queryParams;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new AppError('Conversation not found or access denied.', 403);
    }

    // Auto-mark incoming messages as read by current user
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, 'readBy.user': { $ne: userId } },
      { $push: { readBy: { user: userId, readAt: new Date() } } }
    );

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId, isDeleted: false })
        .populate('sender', 'firstName lastName profile.avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Message.countDocuments({ conversation: conversationId, isDeleted: false })
    ]);

    return {
      messages: messages.reverse(),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Send Real-Time Chat Message
   */
  async sendMessage(senderId, conversationId, content, attachments = []) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(senderId)) {
      throw new AppError('Conversation not found or access denied.', 403);
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      content,
      type: attachments.length > 0 ? 'file' : 'text',
      attachments,
      readBy: [{ user: senderId, readAt: new Date() }]
    });

    const populatedMessage = await message.populate('sender', 'firstName lastName profile.avatar');

    // Update Conversation last message
    conversation.lastMessage = {
      content: content.substring(0, 100),
      sender: senderId,
      sentAt: new Date()
    };
    conversation.updatedAt = new Date();
    await conversation.save();

    // Broadcast Real-Time Message via Socket.IO
    try {
      const io = getIO();
      conversation.participants.forEach((participantId) => {
        if (participantId.toString() !== senderId.toString()) {
          io.to(`user_${participantId.toString()}`).emit('new_message', {
            conversationId,
            message: populatedMessage
          });
        }
      });
    } catch (socketErr) {
      // Socket offline
    }

    // Send in-app notification to receiver
    try {
      const notificationService = require('./notificationService');
      const receiverId = conversation.participants.find((p) => p.toString() !== senderId.toString());
      if (receiverId) {
        const sender = await User.findById(senderId).select('firstName lastName role');
        await notificationService.notify({
          user: receiverId,
          type: 'new_message',
          title: `New 1-on-1 Message from ${sender?.firstName || 'User'}`,
          message: `"${content.substring(0, 80)}${content.length > 80 ? '...' : ''}"`,
          link: sender?.role === 'student' ? '/mentor/dashboard' : '/my-courses',
          priority: 'medium'
        });
      }
    } catch (notifErr) {
      console.warn('⚠️ Could not send message notification:', notifErr.message);
    }

    return populatedMessage;
  }
}

module.exports = new MessageService();
