const asyncHandler = require('../middleware/asyncHandler');
const quizService = require('../services/quizService');
const { successResponse } = require('../utils/apiResponse');

exports.getCourseQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await quizService.getCourseQuizzes(req.params.courseId, req.user);
  return successResponse(res, 'Course quizzes fetched', { quizzes });
});

exports.getQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.getQuizById(req.params.id, req.user);
  return successResponse(res, 'Quiz details fetched', { quiz });
});

exports.createQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.createQuiz(req.user._id, req.body);
  return successResponse(res, 'Quiz created successfully', { quiz }, 201);
});

exports.updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.updateQuiz(req.params.id, req.user._id, req.user.role, req.body);
  return successResponse(res, 'Quiz updated successfully', { quiz });
});

exports.deleteQuiz = asyncHandler(async (req, res) => {
  const result = await quizService.deleteQuiz(req.params.id, req.user._id, req.user.role);
  return successResponse(res, result.message);
});
