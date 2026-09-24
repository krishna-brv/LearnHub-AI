const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Badge = require('../models/Badge');
const XPTransaction = require('../models/XPTransaction');
const LearningActivity = require('../models/LearningActivity');
const AppError = require('../utils/AppError');

class GamificationService {
  /**
   * Get User Gamification Stats (XP, Level, Badges)
   */
  async getUserStats(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const [badges, streakActivity] = await Promise.all([
      Badge.find({ user: userId }).populate('achievement'),
      LearningActivity.find({ student: userId }).sort({ date: -1 }).limit(30)
    ]);

    // Calculate level progression (Every 500 XP = 1 Level)
    const currentXP = user.xp || 0;
    const currentLevel = Math.floor(currentXP / 500) + 1;
    const xpInCurrentLevel = currentXP % 500;
    const xpForNextLevel = 500;
    const progressPercentage = Math.round((xpInCurrentLevel / xpForNextLevel) * 100);

    return {
      xp: currentXP,
      level: currentLevel,
      xpInCurrentLevel,
      xpForNextLevel,
      progressPercentage,
      streak: user.streak || { current: 0, longest: 0 },
      badgesCount: badges.length,
      badges
    };
  }

  /**
   * Get Global Leaderboard (Top 20 XP Earners)
   */
  async getLeaderboard(limit = 20) {
    const leaderboard = await User.find({ role: 'student', isActive: true })
      .select('firstName lastName username profile.avatar xp level streak studentProfile.careerGoal')
      .sort({ xp: -1 })
      .limit(parseInt(limit, 10));

    return leaderboard;
  }

  /**
   * Get Achievements List & Earned Status
   */
  async getAchievements(userId) {
    const [allAchievements, userBadges] = await Promise.all([
      Achievement.find({ isActive: true }).sort({ order: 1 }),
      Badge.find({ user: userId })
    ]);

    const earnedSet = new Set(userBadges.map((b) => b.achievement.toString()));

    const result = allAchievements.map((ach) => {
      const achObj = ach.toObject();
      achObj.isUnlocked = earnedSet.has(ach._id.toString());
      const userBadge = userBadges.find((b) => b.achievement.toString() === ach._id.toString());
      achObj.unlockedAt = userBadge ? userBadge.earnedAt : null;
      return achObj;
    });

    return result;
  }

  /**
   * Get XP Transaction History
   */
  async getXPHistory(userId, queryParams) {
    const { page = 1, limit = 20 } = queryParams;
    const result = await XPTransaction.getHistory(userId, page, limit);
    return result;
  }

  /**
   * Get Daily Challenge
   */
  async getDailyChallenge(userId) {
    // Generate or fetch today's challenge based on student's weak topics
    const todayStr = new Date().toISOString().split('T')[0];
    
    return {
      id: `challenge_${todayStr}`,
      title: 'Daily Code & Concepts Sprint',
      description: 'Complete 1 practice quiz and complete at least 1 lesson today to maintain your streak!',
      xpReward: 50,
      targetCount: 2,
      currentCount: 0,
      isCompleted: false,
      date: todayStr
    };
  }

  /**
   * Complete Daily Challenge
   */
  async completeDailyChallenge(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found.', 404);

    await XPTransaction.addXP(
      userId,
      50,
      'daily_challenge',
      'Completed Daily Sprint Challenge',
      null,
      null,
      'Daily challenge completion reward'
    );

    return { message: 'Daily challenge completed! +50 XP awarded!' };
  }
}

module.exports = new GamificationService();
