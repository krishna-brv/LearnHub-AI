const asyncHandler = require('../middleware/asyncHandler');
const portfolioService = require('../services/portfolioService');
const { successResponse } = require('../utils/apiResponse');

exports.getPublicPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.getPublicPortfolio(req.params.username);
  return successResponse(res, 'Public portfolio fetched', { portfolio });
});

exports.updatePortfolioSettings = asyncHandler(async (req, res) => {
  const settings = await portfolioService.updatePortfolioSettings(req.user._id, req.body);
  return successResponse(res, 'Portfolio settings updated', { settings });
});
