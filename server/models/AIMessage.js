/**
 * AIMessage Model
 * Represents a single message in an AI conversation.
 */
const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIConversation',
    required: [true, 'Conversation is required']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['user', 'assistant', 'system'],
      message: '{VALUE} is not a valid role'
    }
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  tokens: {
    type: Number,
    default: 0
  },
  model: {
    type: String,
    trim: true
  },
  latencyMs: {
    type: Number
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
aiMessageSchema.index({ conversation: 1, createdAt: 1 });

// Statics
aiMessageSchema.statics.findByConversation = function(conversationId, limit) {
  let query = this.find({ conversation: conversationId }).sort({ createdAt: 1 });
  if (limit) {
    query = query.limit(limit);
  }
  return query;
};

aiMessageSchema.statics.getConversationHistory = async function(conversationId, limit) {
  const messages = await this.findByConversation(conversationId, limit);
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
};

module.exports = mongoose.model('AIMessage', aiMessageSchema);
