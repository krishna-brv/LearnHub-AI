/**
 * AIConversation Model
 * Represents an AI chat session.
 */
const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  feature: {
    type: String,
    required: [true, 'Feature is required'],
    enum: {
      values: ['tutor', 'career_advisor', 'resume_analyzer', 'general'],
      message: '{VALUE} is not a valid feature'
    }
  },
  title: {
    type: String,
    trim: true,
    default: 'New Conversation'
  },
  messageCount: {
    type: Number,
    default: 0
  },
  lastMessageAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  model: {
    type: String,
    trim: true
  },
  totalTokens: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
aiConversationSchema.index({ user: 1, feature: 1, createdAt: -1 });
aiConversationSchema.index({ user: 1, course: 1, feature: 1 });
aiConversationSchema.index({ user: 1, isActive: 1, updatedAt: -1 });

// Statics
aiConversationSchema.statics.findByUser = function(userId, feature) {
  const query = { user: userId };
  if (feature) {
    query.feature = feature;
  }
  return this.find(query).sort({ updatedAt: -1 });
};

aiConversationSchema.statics.findActive = function(userId) {
  return this.find({ user: userId, isActive: true }).sort({ updatedAt: -1 });
};

module.exports = mongoose.model('AIConversation', aiConversationSchema);
