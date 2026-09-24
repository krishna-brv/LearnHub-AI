const asyncHandler = require('../middleware/asyncHandler');
const gamificationService = require('../services/gamificationService');
const { successResponse } = require('../utils/apiResponse');

exports.getStats = asyncHandler(async (req, res) => {
  const stats = await gamificationService.getUserStats(req.user._id);
  return successResponse(res, 'Gamification stats fetched', { stats });
});

exports.getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await gamificationService.getLeaderboard(req.query.limit || 20);
  return successResponse(res, 'Leaderboard fetched', { leaderboard });
});

exports.getAchievements = asyncHandler(async (req, res) => {
  const achievements = await gamificationService.getAchievements(req.user._id);
  return successResponse(res, 'Achievements fetched', { achievements });
});

exports.getXPHistory = asyncHandler(async (req, res) => {
  const history = await gamificationService.getXPHistory(req.user._id, req.query);
  return successResponse(res, 'XP transaction history fetched', { history: history.history }, 200, history.pagination);
});

exports.getDailyChallenge = asyncHandler(async (req, res) => {
  const challenge = await gamificationService.getDailyChallenge(req.user._id);
  return successResponse(res, 'Daily challenge fetched', { challenge });
});

exports.completeDailyChallenge = asyncHandler(async (req, res) => {
  const result = await gamificationService.completeDailyChallenge(req.user._id);
  return successResponse(res, result.message);
});
