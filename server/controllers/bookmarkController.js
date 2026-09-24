const asyncHandler = require('../middleware/asyncHandler');
const bookmarkService = require('../services/bookmarkService');
const { successResponse } = require('../utils/apiResponse');

exports.toggleBookmark = asyncHandler(async (req, res) => {
  const result = await bookmarkService.toggleBookmark(req.user._id, req.body);
  return successResponse(res, result.message, result);
});

exports.createBookmark = asyncHandler(async (req, res) => {
  const result = await bookmarkService.toggleBookmark(req.user._id, req.body);
  return successResponse(res, result.message, { bookmark: result.bookmark }, 201);
});

exports.getBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await bookmarkService.getUserBookmarks(req.user._id, req.query.type);
  return successResponse(res, 'Bookmarks fetched', { bookmarks });
});

exports.deleteBookmark = asyncHandler(async (req, res) => {
  const result = await bookmarkService.deleteBookmark(req.user._id, req.params.id);
  return successResponse(res, result.message);
});
