/**
 * AIRecommendation Model
 * Represents cached AI recommendations for a user.
 */
const mongoose = require('mongoose');

const aiRecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: {
      values: ['course', 'skill', 'project', 'career', 'revision', 'daily_challenge'],
      message: '{VALUE} is not a valid recommendation type'
    }
  },
  recommendations: [{
    title: String,
    description: String,
    reason: String,
    priority: Number,
    metadata: mongoose.Schema.Types.Mixed
  }],
  context: {
    type: mongoose.Schema.Types.Mixed
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required']
  },
  promptVersion: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  isExpired: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
aiRecommendationSchema.index({ user: 1, type: 1, isExpired: 1 });
aiRecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Statics
aiRecommendationSchema.statics.findLatest = function(userId, type) {
  return this.findOne({
    user: userId,
    type: type,
    isExpired: false,
    expiresAt: { $gt: new Date() }
  }).sort({ generatedAt: -1 });
};

aiRecommendationSchema.statics.invalidate = function(userId, type) {
  return this.updateMany(
    { user: userId, type: type, isExpired: false },
    { $set: { isExpired: true } }
  );
};

module.exports = mongoose.model('AIRecommendation', aiRecommendationSchema);
