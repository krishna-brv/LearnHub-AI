/**
 * Comment Model for LearnHub AI
 * Represents a threaded reply on a discussion.
 */
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'Content cannot be empty'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  upvoteCount: {
    type: Number,
    default: 0
  },
  isAnswer: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isReported: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

commentSchema.index({ discussion: 1, createdAt: 1 });
commentSchema.index({ discussion: 1, isAnswer: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ author: 1 });

commentSchema.methods.toggleUpvote = async function(userId) {
  const index = this.upvotes.indexOf(userId);
  if (index === -1) {
    this.upvotes.push(userId);
  } else {
    this.upvotes.splice(index, 1);
  }
  this.upvoteCount = this.upvotes.length;
  return this.save();
};

commentSchema.methods.markAsAnswer = async function() {
  this.isAnswer = true;
  return this.save();
};

commentSchema.statics.findByDiscussion = async function(discussionId) {
  return this.find({ discussion: discussionId, parentComment: null, isVisible: true })
    .sort({ createdAt: 1 })
    .populate('author', 'name avatar role');
};

commentSchema.statics.findReplies = async function(commentId) {
  return this.find({ parentComment: commentId, isVisible: true })
    .sort({ createdAt: 1 })
    .populate('author', 'name avatar role');
};

module.exports = mongoose.model('Comment', commentSchema);
