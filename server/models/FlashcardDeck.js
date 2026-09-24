/**
 * FlashcardDeck Model
 * Represents a collection of flashcards for a user.
 */
const mongoose = require('mongoose');

const flashcardDeckSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  source: {
    type: String,
    enum: {
      values: ['manual', 'lesson', 'quiz_mistakes', 'ai_generated'],
      message: '{VALUE} is not a valid source'
    },
    default: 'manual'
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  sourceModel: {
    type: String,
    trim: true
  },
  cardCount: {
    type: Number,
    default: 0
  },
  dueCards: {
    type: Number,
    default: 0
  },
  masteredCards: {
    type: Number,
    default: 0
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  lastStudiedAt: {
    type: Date
  },
  aiPromptVersion: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
flashcardDeckSchema.index({ user: 1, createdAt: -1 });
flashcardDeckSchema.index({ user: 1, source: 1 });
flashcardDeckSchema.index({ user: 1, course: 1 });

// Statics
flashcardDeckSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId, isArchived: false }).sort({ createdAt: -1 });
};

flashcardDeckSchema.statics.findDueDecks = function(userId) {
  return this.find({ user: userId, isArchived: false, dueCards: { $gt: 0 } }).sort({ dueCards: -1 });
};

module.exports = mongoose.model('FlashcardDeck', flashcardDeckSchema);
