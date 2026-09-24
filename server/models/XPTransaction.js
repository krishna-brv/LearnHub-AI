/**
 * XPTransaction Model
 * Represents a history of XP awards and deductions.
 */
const mongoose = require('mongoose');

const xpTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: {
      values: [
        'lesson_complete', 'course_complete', 'quiz_pass', 'quiz_perfect',
        'assignment_submit', 'assignment_excellent', 'streak_bonus',
        'daily_challenge', 'achievement', 'discussion_help', 'first_enrollment',
        'profile_complete', 'referral', 'bonus', 'penalty'
      ],
      message: '{VALUE} is not a valid transaction type'
    },
    trim: true
  },
  source: {
    type: String,
    trim: true
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  sourceModel: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  balanceAfter: {
    type: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
xpTransactionSchema.index({ user: 1, createdAt: -1 });
xpTransactionSchema.index({ user: 1, type: 1 });
xpTransactionSchema.index({ type: 1, createdAt: -1 });

// Statics
xpTransactionSchema.statics.addXP = async function(userId, amount, type, source, sourceId, sourceModel, description) {
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  const balanceAfter = (user.xp || 0) + amount;
  
  const transaction = await this.create({
    user: userId,
    amount,
    type,
    source,
    sourceId,
    sourceModel,
    description,
    balanceAfter
  });
  
  user.xp = balanceAfter;
  
  // Calculate level based on XP (example logic)
  const calculatedLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
  if (calculatedLevel > (user.level || 1)) {
    user.level = calculatedLevel;
  }
  
  await user.save();
  return { transaction, updatedXP: balanceAfter, level: user.level };
};

xpTransactionSchema.statics.getHistory = function(userId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

xpTransactionSchema.statics.getTotalByType = async function(userId) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$type', totalXP: { $sum: '$amount' } } },
    { $sort: { totalXP: -1 } }
  ]);
};

xpTransactionSchema.statics.getLeaderboard = async function(limit = 10) {
  return this.aggregate([
    { $group: { _id: '$user', totalXP: { $sum: '$amount' } } },
    { $sort: { totalXP: -1 } },
    { $limit: limit },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' }
  ]);
};

module.exports = mongoose.model('XPTransaction', xpTransactionSchema);
