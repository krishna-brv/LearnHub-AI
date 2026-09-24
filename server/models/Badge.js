/**
 * Badge Model
 * Represents an earned badge joining User and Achievement.
 */
const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 100
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
badgeSchema.index({ user: 1, achievement: 1 }, { unique: true });
badgeSchema.index({ user: 1, earnedAt: -1 });
badgeSchema.index({ achievement: 1 });

// Statics
badgeSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).populate('achievement');
};

badgeSchema.statics.hasBadge = async function(userId, achievementId) {
  const count = await this.countDocuments({ user: userId, achievement: achievementId, progress: { $gte: 100 } });
  return count > 0;
};

badgeSchema.statics.awardBadge = async function(userId, achievementId, metadata = {}) {
  const existing = await this.findOne({ user: userId, achievement: achievementId });
  if (existing) {
    if (existing.progress < 100) {
      existing.progress = 100;
      existing.earnedAt = new Date();
      existing.metadata = { ...existing.metadata, ...metadata };
      return existing.save();
    }
    return existing;
  }
  return this.create({
    user: userId,
    achievement: achievementId,
    progress: 100,
    earnedAt: new Date(),
    metadata
  });
};

module.exports = mongoose.model('Badge', badgeSchema);
