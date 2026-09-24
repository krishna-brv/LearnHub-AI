const asyncHandler = require('../middleware/asyncHandler');
const attemptService = require('../services/attemptService');
const { successResponse } = require('../utils/apiResponse');

exports.startAttempt = asyncHandler(async (req, res) => {
  const result = await attemptService.startAttempt(req.user._id, req.params.quizId);
  return successResponse(res, 'Quiz attempt started', result, 201);
});

exports.saveAnswer = asyncHandler(async (req, res) => {
  const { questionId, selectedOptions, textAnswer, codeAnswer } = req.body;
  const result = await attemptService.saveAnswer(req.params.id, req.user._id, questionId, {
    selectedOptions,
    textAnswer,
    codeAnswer
  });
  return successResponse(res, result.message);
});

exports.submitAttempt = asyncHandler(async (req, res) => {
  const result = await attemptService.submitAttempt(req.params.id, req.user._id);
  return successResponse(res, 'Quiz attempt submitted and evaluated successfully', result);
});

exports.getStudentHistory = asyncHandler(async (req, res) => {
  const attempts = await attemptService.getStudentAttemptHistory(req.user._id, req.params.quizId);
  return successResponse(res, 'Quiz attempt history fetched', { attempts });
});

exports.getAttemptDetails = asyncHandler(async (req, res) => {
  const attempt = await attemptService.getAttemptDetails(req.params.id, req.user._id, req.user.role);
  return successResponse(res, 'Attempt details fetched', { attempt });
});
