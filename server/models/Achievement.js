/**
 * Achievement Model
 * Represents achievement definitions that users can earn.
 */
const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  icon: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: {
      values: ['learning', 'quiz', 'assignment', 'streak', 'social', 'milestone', 'special'],
      message: '{VALUE} is not a valid achievement category'
    },
    trim: true
  },
  xpReward: {
    type: Number,
    required: true,
    default: 0
  },
  criteria: {
    type: {
      type: String,
      enum: {
        values: ['count', 'streak', 'score', 'completion'],
        message: '{VALUE} is not a valid criteria type'
      },
      trim: true
    },
    target: { type: Number },
    resource: { type: String, trim: true }
  },
  rarity: {
    type: String,
    enum: {
      values: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      message: '{VALUE} is not a valid rarity'
    },
    default: 'common',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
achievementSchema.index({ category: 1, isActive: 1 });
achievementSchema.index({ isActive: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);
