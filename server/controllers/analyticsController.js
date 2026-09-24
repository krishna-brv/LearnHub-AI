const asyncHandler = require('../middleware/asyncHandler');
const analyticsService = require('../services/analyticsService');
const { successResponse } = require('../utils/apiResponse');

exports.getAdminAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getAdminAnalytics();
  return successResponse(res, 'Admin analytics fetched', { analytics });
});

exports.getInstructorAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getInstructorAnalytics(req.user._id);
  return successResponse(res, 'Instructor analytics fetched', { analytics });
});
