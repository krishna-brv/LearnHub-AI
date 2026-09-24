const groqService = require('./groqService');
const aiPromptService = require('./aiPromptService');
const AIConversation = require('../../models/AIConversation');
const AIMessage = require('../../models/AIMessage');
const Lesson = require('../../models/Lesson');
const Course = require('../../models/Course');
const AppError = require('../../utils/AppError');

class TutorService {
  /**
   * Send message to AI Tutor
   */
  async chat({ userId, conversationId, message, courseId, lessonId }) {
    let conversation;

    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, user: userId });
      if (!conversation) {
        throw new AppError('AI Conversation not found.', 404);
      }
    } else {
      conversation = await AIConversation.create({
        user: userId,
        course: courseId || null,
        lesson: lessonId || null,
        feature: 'tutor',
        title: message.substring(0, 40) + '...',
        model: groqService.selectModel('fast')
      });
    }

    // Fetch course / lesson title for prompt context
    let courseTitle = '';
    let lessonTitle = '';
    if (lessonId) {
      const lesson = await Lesson.findById(lessonId).populate('course', 'title');
      if (lesson) {
        lessonTitle = lesson.title;
        courseTitle = lesson.course?.title || '';
      }
    } else if (courseId) {
      const course = await Course.findById(courseId);
      if (course) courseTitle = course.title;
    }

    // Save user message to DB
    await AIMessage.create({
      conversation: conversation._id,
      role: 'user',
      content: message
    });

    // Build chat history for Groq
    const previousMessages = await AIMessage.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10);

    const { systemPrompt } = aiPromptService.getTutorPrompt(courseTitle, lessonTitle, false);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...previousMessages.map((m) => ({ role: m.role, content: m.content }))
    ];

    // Request Groq Chat Completion (Fast model for quick chat response)
    const result = await groqService.chatCompletion({
      messages,
      tier: 'fast',
      feature: 'tutor',
      userId
    });

    // Save AI response to DB
    const aiMessage = await AIMessage.create({
      conversation: conversation._id,
      role: 'assistant',
      content: result.content,
      tokens: result.usage?.total_tokens || 0,
      model: result.model,
      latencyMs: result.latencyMs
    });

    // Update conversation metadata
    conversation.messageCount += 2;
    conversation.lastMessageAt = new Date();
    conversation.totalTokens += result.usage?.total_tokens || 0;
    await conversation.save();

    return {
      conversationId: conversation._id,
      message: aiMessage,
      isFallback: result.isFallback
    };
  }

  /**
   * Get User AI Conversations
   */
  async getConversations(userId) {
    const conversations = await AIConversation.find({ user: userId, feature: 'tutor', isActive: true })
      .populate('course', 'title thumbnail')
      .sort({ lastMessageAt: -1 });

    return conversations;
  }

  /**
   * Get Single Conversation Messages
   */
  async getConversationMessages(userId, conversationId) {
    const conversation = await AIConversation.findOne({ _id: conversationId, user: userId });
    if (!conversation) {
      throw new AppError('Conversation not found.', 404);
    }

    const messages = await AIMessage.find({ conversation: conversationId }).sort({ createdAt: 1 });
    return { conversation, messages };
  }
}

module.exports = new TutorService();
