const User = require('../models/User');
const Certificate = require('../models/Certificate');
const Progress = require('../models/Progress');
const Badge = require('../models/Badge');
const StudentSkill = require('../models/StudentSkill');
const AppError = require('../utils/AppError');

class PortfolioService {
  /**
   * Get Public Portfolio by Username
   */
  async getPublicPortfolio(username) {
    if (!username) {
      throw new AppError('Username or user ID is required.', 400);
    }
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(username);
    const query = isObjectId
      ? { _id: username, isActive: true }
      : { username: username.toLowerCase(), isActive: true };

    const user = await User.findOne(query)
      .select('firstName lastName username profile studentProfile portfolioSettings xp level streak createdAt');

    if (!user) {
      throw new AppError('Portfolio not found.', 404);
    }

    if (user.portfolioSettings && user.portfolioSettings.isPublic === false) {
      throw new AppError('This user portfolio is set to private.', 403);
    }

    const [certificates, progressList, badges, skills] = await Promise.all([
      user.portfolioSettings?.showCertificates !== false
        ? Certificate.find({ student: user._id, isValid: true }).populate('course', 'title thumbnail category')
        : [],
      user.portfolioSettings?.showCourses !== false
        ? Progress.find({ student: user._id, overallProgress: { $gt: 0 } }).populate('course', 'title thumbnail category level')
        : [],
      user.portfolioSettings?.showAchievements !== false
        ? Badge.find({ user: user._id }).populate('achievement')
        : [],
      user.portfolioSettings?.showSkills !== false
        ? StudentSkill.find({ student: user._id, status: { $in: ['learning', 'mastered'] } }).populate('skill')
        : []
    ]);

    return {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatar: user.profile?.avatar,
        bio: user.profile?.bio,
        headline: user.profile?.headline,
        githubUrl: user.profile?.githubUrl,
        linkedinUrl: user.profile?.linkedinUrl,
        portfolioUrl: user.profile?.portfolioUrl,
        location: user.profile?.location,
        skills: user.studentProfile?.skills || [],
        interests: user.studentProfile?.interests || [],
        careerGoal: user.studentProfile?.careerGoal,
        education: user.studentProfile?.education || [],
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        memberSince: user.createdAt
      },
      projects: user.portfolioSettings?.projects || [],
      certificates,
      courses: progressList,
      badges,
      skillProgress: skills
    };
  }

  /**
   * Update Student Portfolio Settings & Projects
   */
  async updatePortfolioSettings(userId, settingsData) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { portfolioSettings: settingsData } },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user.portfolioSettings;
  }
}

module.exports = new PortfolioService();
