/**
 * AIUsageLog Model
 * Tracks AI cost and usage for analytics.
 */
const mongoose = require('mongoose');

const aiUsageLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  feature: {
    type: String,
    required: [true, 'Feature is required'],
    enum: {
      values: [
        'tutor', 'learning_path', 'quiz_generator', 'weakness_detection',
        'assignment_feedback', 'career_advisor', 'resume_analyzer',
        'mock_interview', 'smart_notes', 'flashcards', 'daily_challenge',
        'risk_detection', 'quality_review'
      ],
      message: '{VALUE} is not a valid feature'
    }
  },
  model: {
    type: String,
    required: [true, 'Model is required']
  },
  inputTokens: {
    type: Number,
    default: 0
  },
  outputTokens: {
    type: Number,
    default: 0
  },
  totalTokens: {
    type: Number,
    default: 0
  },
  latencyMs: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: {
      values: ['success', 'error', 'timeout', 'rate_limited'],
      message: '{VALUE} is not a valid status'
    },
    default: 'success'
  },
  error: {
    type: String
  },
  promptVersion: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  cost: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
aiUsageLogSchema.index({ user: 1, feature: 1, createdAt: -1 });
aiUsageLogSchema.index({ feature: 1, createdAt: -1 });
aiUsageLogSchema.index({ status: 1, createdAt: -1 });
aiUsageLogSchema.index({ createdAt: -1 });

// Statics
aiUsageLogSchema.statics.log = async function(data) {
  return this.create(data);
};

aiUsageLogSchema.statics.getUsageByFeature = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'success'
      }
    },
    {
      $group: {
        _id: '$feature',
        totalTokens: { $sum: '$totalTokens' },
        totalRequests: { $sum: 1 },
        avgLatency: { $avg: '$latencyMs' }
      }
    },
    { $sort: { totalTokens: -1 } }
  ]);
};

aiUsageLogSchema.statics.getUsageByUser = function(userId, startDate, endDate) {
  const matchObj = { user: mongoose.Types.ObjectId(userId) };
  if (startDate && endDate) {
    matchObj.createdAt = { $gte: startDate, $lte: endDate };
  }
  return this.aggregate([
    { $match: matchObj },
    {
      $group: {
        _id: '$feature',
        totalTokens: { $sum: '$totalTokens' },
        totalRequests: { $sum: 1 }
      }
    }
  ]);
};

aiUsageLogSchema.statics.getDailyUsage = function(days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: cutoff } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        totalTokens: { $sum: '$totalTokens' },
        requests: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

aiUsageLogSchema.statics.getFailureRate = async function(feature, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const matchObj = { createdAt: { $gte: cutoff } };
  if (feature) matchObj.feature = feature;
  
  const stats = await this.aggregate([
    { $match: matchObj },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  let success = 0;
  let failure = 0;
  
  stats.forEach(stat => {
    if (stat._id === 'success') {
      success += stat.count;
    } else {
      failure += stat.count;
    }
  });
  
  const total = success + failure;
  if (total === 0) return 0;
  
  return (failure / total) * 100;
};

module.exports = mongoose.model('AIUsageLog', aiUsageLogSchema);
