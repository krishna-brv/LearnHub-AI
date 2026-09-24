/**
 * Conversation Model
 * Represents a chat conversation between users (direct or group).
 */
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: {
      values: ['direct', 'group'],
      message: '{VALUE} is not a valid conversation type'
    },
    default: 'direct',
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  lastMessage: {
    content: { type: String, trim: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentAt: { type: Date }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ participants: 1, type: 1 });

// Statics
conversationSchema.statics.findByParticipant = function(userId) {
  return this.find({ participants: userId, isActive: true })
    .sort({ updatedAt: -1 });
};

conversationSchema.statics.findDirectConversation = function(userId1, userId2) {
  return this.findOne({
    type: 'direct',
    participants: { $all: [userId1, userId2] }
  });
};

conversationSchema.statics.findOrCreate = async function(participants, type = 'direct') {
  if (type === 'direct') {
    const existing = await this.findDirectConversation(participants[0], participants[1]);
    if (existing) return existing;
  }
  
  return this.create({ participants, type });
};

module.exports = mongoose.model('Conversation', conversationSchema);
