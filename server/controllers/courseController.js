const asyncHandler = require('../middleware/asyncHandler');
const courseService = require('../services/courseService');
const { successResponse } = require('../utils/apiResponse');

exports.getCourses = asyncHandler(async (req, res) => {
  const result = await courseService.getPublishedCourses(req.query);
  return successResponse(res, 'Published courses fetched', { courses: result.courses }, 200, result.pagination);
});

exports.getCourse = asyncHandler(async (req, res) => {
  const slugOrId = req.params.slug || req.params.id;
  const course = await courseService.getCourseDetails(slugOrId, req.user);
  return successResponse(res, 'Course details fetched', { course });
});

exports.createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.user._id, req.body);
  return successResponse(res, 'Course created successfully', { course }, 201);
});

exports.updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.user._id, req.body, req.user.role);
  return successResponse(res, 'Course updated successfully', { course });
});

exports.submitCourse = asyncHandler(async (req, res) => {
  const result = await courseService.submitCourseForReview(req.params.id, req.user._id);
  return successResponse(res, result.message, { course: result.course });
});

exports.publishCourse = asyncHandler(async (req, res) => {
  const result = await courseService.publishCourse(req.params.id, req.user._id, req.user.role);
  return successResponse(res, result.message, { course: result.course });
});

exports.archiveCourse = asyncHandler(async (req, res) => {
  const result = await courseService.archiveCourse(req.params.id, req.user._id, req.user.role);
  return successResponse(res, result.message, { course: result.course });
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  const result = await courseService.deleteDraftCourse(req.params.id, req.user._id);
  return successResponse(res, result.message);
});

exports.getInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getInstructorCourses(req.user._id);
  return successResponse(res, 'Instructor courses fetched', { courses });
});

exports.getReviewQueue = asyncHandler(async (req, res) => {
  const courses = await courseService.getReviewQueue();
  return successResponse(res, 'Review queue fetched', { courses });
});

exports.reviewCourse = asyncHandler(async (req, res) => {
  const { status, reviewNotes } = req.body;
  const result = await courseService.reviewCourse(req.params.id, status, reviewNotes);
  return successResponse(res, result.message, { course: result.course });
});

exports.sendAnnouncement = asyncHandler(async (req, res) => {
  const result = await courseService.sendCourseAnnouncement(req.params.id, req.user._id, req.body);
  return successResponse(res, result.message, { sentCount: result.sentCount });
});
