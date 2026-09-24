const asyncHandler = require('../middleware/asyncHandler');
const discussionService = require('../services/discussionService');
const { successResponse } = require('../utils/apiResponse');

exports.getDiscussions = asyncHandler(async (req, res) => {
  const result = await discussionService.getCourseDiscussions(req.params.courseId, req.query);
  return successResponse(res, 'Discussions fetched', { discussions: result.discussions }, 200, result.pagination);
});

exports.getDiscussion = asyncHandler(async (req, res) => {
  const discussion = await discussionService.getDiscussionDetails(req.params.id);
  return successResponse(res, 'Discussion details fetched', { discussion });
});

exports.createDiscussion = asyncHandler(async (req, res) => {
  const discussion = await discussionService.createDiscussion(req.user._id, req.params.courseId, req.body);
  return successResponse(res, 'Discussion post created', { discussion }, 201);
});

exports.toggleUpvote = asyncHandler(async (req, res) => {
  const result = await discussionService.toggleUpvote(req.params.id, req.user._id);
  return successResponse(res, 'Upvote toggled', result);
});

exports.addComment = asyncHandler(async (req, res) => {
  const comment = await discussionService.addComment(req.user._id, req.params.id, req.body);
  return successResponse(res, 'Comment posted', { comment }, 201);
});

exports.markAnswer = asyncHandler(async (req, res) => {
  const result = await discussionService.markCommentAsAnswer(req.params.commentId, req.user._id);
  return successResponse(res, result.message, { comment: result.comment });
});
