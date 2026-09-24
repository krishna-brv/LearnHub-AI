/**
 * Message Model
 * Represents a chat message within a conversation.
 */
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [5000, 'Message content cannot exceed 5000 characters']
  },
  type: {
    type: String,
    enum: {
      values: ['text', 'image', 'file', 'system'],
      message: '{VALUE} is not a valid message type'
    },
    default: 'text',
    trim: true
  },
  attachments: [{
    filename: { type: String, trim: true },
    url: { type: String, trim: true },
    size: { type: Number },
    mimeType: { type: String, trim: true }
  }],
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ conversation: 1, 'readBy.user': 1 });

// Methods
messageSchema.methods.markAsRead = async function(userId) {
  const isRead = this.readBy.some(read => read.user.toString() === userId.toString());
  if (!isRead) {
    this.readBy.push({ user: userId, readAt: new Date() });
    await this.save();
  }
  return this;
};

messageSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
  return this;
};

// Statics
messageSchema.statics.findByConversation = function(conversationId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  return this.find({ conversation: conversationId, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

messageSchema.statics.getUnreadCount = async function(conversationId, userId) {
  return this.countDocuments({
    conversation: conversationId,
    sender: { $ne: userId },
    'readBy.user': { $ne: userId }
  });
};

module.exports = mongoose.model('Message', messageSchema);
