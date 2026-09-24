/**
 * Discussion Model for LearnHub AI
 * Represents a forum post or discussion thread within a course.
 */
const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: {
      values: ['question', 'discussion', 'announcement', 'resource', 'help'],
      message: '{VALUE} is not a valid discussion type'
    },
    default: 'discussion',
    trim: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isAnswered: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  upvoteCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
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

discussionSchema.index({ course: 1, lastActivityAt: -1 });
discussionSchema.index({ course: 1, isPinned: -1, lastActivityAt: -1 });
discussionSchema.index({ author: 1 });
discussionSchema.index({ course: 1, lesson: 1 });
discussionSchema.index({ title: 'text', content: 'text' });

discussionSchema.methods.toggleUpvote = async function(userId) {
  const index = this.upvotes.indexOf(userId);
  if (index === -1) {
    this.upvotes.push(userId);
  } else {
    this.upvotes.splice(index, 1);
  }
  this.upvoteCount = this.upvotes.length;
  return this.save();
};

discussionSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

discussionSchema.statics.findByCourse = async function(courseId, page = 1, limit = 10, sort = { isPinned: -1, lastActivityAt: -1 }) {
  const skip = (page - 1) * limit;
  return this.find({ course: courseId, isVisible: true })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar role');
};

discussionSchema.statics.findByLesson = async function(courseId, lessonId) {
  return this.find({ course: courseId, lesson: lessonId, isVisible: true })
    .sort({ isPinned: -1, lastActivityAt: -1 })
    .populate('author', 'name avatar role');
};

module.exports = mongoose.model('Discussion', discussionSchema);
