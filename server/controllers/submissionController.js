const asyncHandler = require('../middleware/asyncHandler');
const submissionService = require('../services/submissionService');
const { successResponse } = require('../utils/apiResponse');

exports.submitAssignment = asyncHandler(async (req, res) => {
  const result = await submissionService.submitAssignment(req.user._id, req.params.assignmentId, req.body, req.files);
  return successResponse(res, result.message, { submission: result.submission }, 201);
});

exports.gradeSubmission = asyncHandler(async (req, res) => {
  const result = await submissionService.gradeSubmission(req.params.id, req.user._id, req.body);
  return successResponse(res, result.message, { submission: result.submission });
});

exports.getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const submissions = await submissionService.getAssignmentSubmissions(req.params.assignmentId);
  return successResponse(res, 'Submissions fetched', { submissions });
});

exports.getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await submissionService.getStudentSubmissions(req.user._id, req.query.courseId);
  return successResponse(res, 'My submissions fetched', { submissions });
});
