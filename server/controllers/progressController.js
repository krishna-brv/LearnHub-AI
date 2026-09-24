const progressService = require('../services/progressService');
const lessonService = require('../services/lessonService');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.getCourseProgress = asyncHandler(async (req, res) => {
  const progress = await progressService.getCourseProgress(req.user._id, req.params.courseId);
  return successResponse(res, 'Course progress fetched', { progress });
});

exports.completeLesson = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.body;
  if (!lessonId) {
    throw new AppError('Lesson ID is required', 400);
  }
  const result = await lessonService.markLessonComplete(req.user._id, lessonId);
  const updatedProgress = await progressService.getCourseProgress(req.user._id, courseId || result.course);
  return successResponse(res, 'Lesson marked complete', { progress: updatedProgress, result });
});

exports.getOverview = asyncHandler(async (req, res) => {
  const overview = await progressService.getStudentOverview(req.user._id);
  return successResponse(res, 'Learning overview fetched', { overview });
});

exports.getHeatmap = asyncHandler(async (req, res) => {
  const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
  const heatmap = await progressService.getLearningHeatmap(req.user._id, year);
  return successResponse(res, 'Learning activity heatmap fetched', { heatmap });
});

exports.getStreak = asyncHandler(async (req, res) => {
  const streak = await progressService.getStudentStreak(req.user._id);
  return successResponse(res, 'Learning streak fetched', { streak });
});

exports.getStudyTime = asyncHandler(async (req, res) => {
  const studyTime = await progressService.getStudyTimeStats(req.user._id);
  return successResponse(res, 'Study time statistics fetched', { studyTime });
});
