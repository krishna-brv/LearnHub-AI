const asyncHandler = require('../middleware/asyncHandler');
const enrollmentService = require('../services/enrollmentService');
const { successResponse } = require('../utils/apiResponse');

exports.enroll = asyncHandler(async (req, res) => {
  const { courseId, source } = req.body;
  const result = await enrollmentService.enrollInCourse(req.user._id, courseId, source);
  return successResponse(res, result.message, { enrollment: result.enrollment }, 201);
});

exports.getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.getMyEnrollments(req.user._id, req.query.status);
  return successResponse(res, 'My enrollments fetched', { enrollments });
});

exports.getCourseEnrollments = asyncHandler(async (req, res) => {
  const result = await enrollmentService.getCourseEnrollments(req.params.courseId, req.query);
  return successResponse(res, 'Course enrollments fetched', { enrollments: result.enrollments }, 200, result.pagination);
});

exports.unenroll = asyncHandler(async (req, res) => {
  const result = await enrollmentService.unenroll(req.user._id, req.params.courseId);
  return successResponse(res, result.message);
});
