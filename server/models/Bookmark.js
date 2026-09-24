/**
 * Bookmark Model
 * Polymorphic bookmarks for various resources.
 */
const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resourceType: {
    type: String,
    required: true,
    enum: {
      values: ['lesson', 'course', 'discussion', 'note', 'question'],
      message: '{VALUE} is not a valid resource type'
    },
    trim: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  title: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
bookmarkSchema.index({ user: 1, resourceType: 1, resourceId: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, resourceType: 1, createdAt: -1 });
bookmarkSchema.index({ user: 1, course: 1 });

// Statics
bookmarkSchema.statics.findByUser = function(userId, resourceType) {
  const query = { user: userId };
  if (resourceType) {
    query.resourceType = resourceType;
  }
  return this.find(query).sort({ createdAt: -1 });
};

bookmarkSchema.statics.isBookmarked = async function(userId, resourceType, resourceId) {
  const count = await this.countDocuments({ user: userId, resourceType, resourceId });
  return count > 0;
};

bookmarkSchema.statics.toggle = async function(userId, resourceType, resourceId, title, course) {
  const existing = await this.findOne({ user: userId, resourceType, resourceId });
  if (existing) {
    await existing.deleteOne();
    return { bookmarked: false };
  }
  
  const newBookmark = await this.create({
    user: userId,
    resourceType,
    resourceId,
    title,
    course
  });
  return { bookmarked: true, bookmark: newBookmark };
};

module.exports = mongoose.model('Bookmark', bookmarkSchema);
