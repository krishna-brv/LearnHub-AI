const asyncHandler = require('../middleware/asyncHandler');
const questionService = require('../services/questionService');
const { successResponse } = require('../utils/apiResponse');

exports.getQuizQuestions = asyncHandler(async (req, res) => {
  const questions = await questionService.getQuizQuestions(req.params.quizId, req.user);
  return successResponse(res, 'Quiz questions fetched', { questions });
});

exports.createQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.createQuestion(req.body);
  return successResponse(res, 'Question created successfully', { question }, 201);
});

exports.bulkCreateQuestions = asyncHandler(async (req, res) => {
  const { quizId, questions } = req.body;
  const createdQuestions = await questionService.bulkCreateQuestions(quizId, questions);
  return successResponse(res, 'Questions imported successfully', { questions: createdQuestions }, 201);
});

exports.updateQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.updateQuestion(req.params.id, req.body);
  return successResponse(res, 'Question updated successfully', { question });
});

exports.deleteQuestion = asyncHandler(async (req, res) => {
  const result = await questionService.deleteQuestion(req.params.id);
  return successResponse(res, result.message);
});
