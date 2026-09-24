/**
 * Note Model
 * Represents a user's personal knowledge base note.
 */
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for a note']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    trim: true,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  folder: {
    type: String,
    trim: true,
    default: 'General'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  linkedNotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  }],
  isStarred: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  wordCount: {
    type: Number,
    default: 0
  },
  lastEditedAt: {
    type: Date,
    default: Date.now
  },
  aiSummary: {
    type: String,
    trim: true
  },
  aiSummaryGeneratedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
noteSchema.index({ user: 1, folder: 1, createdAt: -1 });
noteSchema.index({ user: 1, isStarred: 1 });
noteSchema.index({ user: 1, course: 1 });
noteSchema.index({ user: 1, tags: 1 });
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Pre-save hook to calculate word count
noteSchema.pre('save', function() {
  if (this.isModified('content')) {
    this.wordCount = this.content ? this.content.split(/\s+/).filter(word => word.length > 0).length : 0;
    this.lastEditedAt = Date.now();
  }
});

// Statics
noteSchema.statics.findByUser = function(userId, folder, page = 1, limit = 10) {
  const query = { user: userId, isArchived: false };
  if (folder) {
    query.folder = folder;
  }
  return this.find(query)
    .sort({ lastEditedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

noteSchema.statics.getFolders = async function(userId) {
  return this.distinct('folder', { user: userId, isArchived: false });
};

noteSchema.statics.searchNotes = function(userId, query) {
  return this.find({
    user: userId,
    isArchived: false,
    $text: { $search: query }
  }).sort({ score: { $meta: 'textScore' }, lastEditedAt: -1 });
};

module.exports = mongoose.model('Note', noteSchema);
