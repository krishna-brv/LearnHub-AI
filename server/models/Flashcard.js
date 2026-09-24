/**
 * Flashcard Model
 * Represents a single flashcard with SM-2 spaced repetition algorithm fields.
 */
const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FlashcardDeck',
    required: [true, 'Deck is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  front: {
    type: String,
    required: [true, 'Front content is required'],
    trim: true
  },
  back: {
    type: String,
    required: [true, 'Back content is required'],
    trim: true
  },
  difficulty: {
    type: String,
    enum: {
      values: ['easy', 'medium', 'hard'],
      message: '{VALUE} is not a valid difficulty'
    },
    default: 'medium'
  },
  nextReviewAt: {
    type: Date,
    default: Date.now
  },
  interval: {
    type: Number,
    default: 1
  },
  easeFactor: {
    type: Number,
    default: 2.5
  },
  repetitions: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  lastReviewedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: {
      values: ['new', 'learning', 'review', 'mastered'],
      message: '{VALUE} is not a valid status'
    },
    default: 'new'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
flashcardSchema.index({ deck: 1, nextReviewAt: 1 });
flashcardSchema.index({ user: 1, nextReviewAt: 1, status: 1 });
flashcardSchema.index({ deck: 1, status: 1 });

// Methods
flashcardSchema.methods.review = function(quality) {
  // Quality should be between 0 and 5
  quality = Math.max(0, Math.min(5, quality));
  
  if (quality >= 3) {
    // Successful recall
    this.repetitions += 1;
    if (this.repetitions === 1) {
      this.interval = 1;
    } else if (this.repetitions === 2) {
      this.interval = 6;
    } else {
      this.interval = Math.round(this.interval * this.easeFactor);
    }
  } else {
    // Failed recall
    this.repetitions = 0;
    this.interval = 1;
  }
  
  // Calculate new ease factor
  this.easeFactor = this.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (this.easeFactor < 1.3) {
    this.easeFactor = 1.3;
  }
  
  // Update next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + this.interval);
  this.nextReviewAt = nextReview;
  this.lastReviewedAt = new Date();
  this.reviewCount += 1;
  
  // Update status
  if (this.repetitions >= 5 && quality >= 4) {
    this.status = 'mastered';
  } else if (this.repetitions > 0) {
    this.status = 'review';
  } else {
    this.status = 'learning';
  }
  
  return this;
};

// Statics
flashcardSchema.statics.findDue = function(userId, deckId) {
  const query = { user: userId, nextReviewAt: { $lte: new Date() } };
  if (deckId) {
    query.deck = deckId;
  }
  return this.find(query).sort({ nextReviewAt: 1 });
};

flashcardSchema.statics.findDueCount = function(userId) {
  return this.countDocuments({ user: userId, nextReviewAt: { $lte: new Date() } });
};

flashcardSchema.statics.findByDeck = function(deckId) {
  return this.find({ deck: deckId });
};

module.exports = mongoose.model('Flashcard', flashcardSchema);
