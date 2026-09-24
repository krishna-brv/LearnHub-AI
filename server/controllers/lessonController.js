const asyncHandler = require('../middleware/asyncHandler');
const lessonService = require('../services/lessonService');
const { successResponse } = require('../utils/apiResponse');

exports.getLessons = asyncHandler(async (req, res) => {
  const lessons = await lessonService.getModuleLessons(req.params.moduleId);
  return successResponse(res, 'Module lessons fetched', { lessons });
});

exports.getLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.getLessonDetails(req.params.id, req.user);
  return successResponse(res, 'Lesson details fetched', { lesson });
});

exports.createLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.createLesson(req.params.courseId, req.params.moduleId, req.body);
  return successResponse(res, 'Lesson created successfully', { lesson }, 201);
});

exports.updateLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.updateLesson(req.params.id, req.body);
  return successResponse(res, 'Lesson updated successfully', { lesson });
});

exports.deleteLesson = asyncHandler(async (req, res) => {
  const result = await lessonService.deleteLesson(req.params.id);
  return successResponse(res, result.message);
});

exports.reorderLessons = asyncHandler(async (req, res) => {
  const lessons = await lessonService.reorderLessons(req.params.moduleId, req.body.lessonOrders);
  return successResponse(res, 'Lessons reordered successfully', { lessons });
});

exports.completeLesson = asyncHandler(async (req, res) => {
  const result = await lessonService.markLessonComplete(req.user._id, req.params.id);
  return successResponse(res, result.message, result);
});
