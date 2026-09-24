const asyncHandler = require('../middleware/asyncHandler');
const tutorService = require('../services/ai/tutorService');
const learningPathService = require('../services/ai/learningPathService');
const quizGeneratorService = require('../services/ai/quizGeneratorService');
const weaknessService = require('../services/ai/weaknessService');
const careerService = require('../services/ai/careerService');
const resumeService = require('../services/ai/resumeService');
const interviewService = require('../services/ai/interviewService');
const smartNotesService = require('../services/ai/smartNotesService');
const flashcardService = require('../services/ai/flashcardService');
const { successResponse } = require('../utils/apiResponse');

// 1. AI Tutor
exports.tutorChat = asyncHandler(async (req, res) => {
  const result = await tutorService.chat({
    userId: req.user._id,
    conversationId: req.body.conversationId,
    message: req.body.message,
    courseId: req.body.courseId,
    lessonId: req.body.lessonId
  });
  return successResponse(res, 'Tutor message processed', result);
});

exports.getTutorConversations = asyncHandler(async (req, res) => {
  const conversations = await tutorService.getConversations(req.user._id);
  return successResponse(res, 'AI Conversations fetched', { conversations });
});

exports.getTutorMessages = asyncHandler(async (req, res) => {
  const result = await tutorService.getConversationMessages(req.user._id, req.params.conversationId);
  return successResponse(res, 'Conversation history fetched', result);
});

// 2. Learning Path
exports.generateLearningPath = asyncHandler(async (req, res) => {
  const pathDoc = await learningPathService.generateLearningPath(req.user._id, req.body);
  return successResponse(res, 'Personalized learning path generated!', { learningPath: pathDoc }, 201);
});

exports.getActiveLearningPath = asyncHandler(async (req, res) => {
  const pathDoc = await learningPathService.getActiveLearningPath(req.user._id);
  return successResponse(res, 'Active learning path fetched', { learningPath: pathDoc });
});

// 3. Quiz Generator
exports.generateQuizQuestions = asyncHandler(async (req, res) => {
  const result = await quizGeneratorService.generateQuestions({
    userId: req.user._id,
    quizId: req.body.quizId,
    topic: req.body.topic,
    difficulty: req.body.difficulty,
    count: req.body.count,
    type: req.body.type
  });
  return successResponse(res, 'AI Quiz Questions generated!', result, 201);
});

// 4. Weakness Detection
exports.analyzeWeakness = asyncHandler(async (req, res) => {
  const analysis = await weaknessService.analyzeWeakness(req.user._id, req.query.courseId);
  return successResponse(res, 'Weakness diagnosis completed', { analysis });
});

exports.getAtRiskStudents = asyncHandler(async (req, res) => {
  const result = await weaknessService.detectAtRiskStudents(req.params.courseId);
  return successResponse(res, 'At-risk students report generated', result);
});

// 5. Career Advisor
exports.getCareerGuidance = asyncHandler(async (req, res) => {
  const { portfolioUrl, resumeText } = req.body || {};
  const guidance = await careerService.getCareerGuidance(req.user._id, {
    portfolioUrl: portfolioUrl || req.query?.portfolioUrl,
    resumeText: resumeText || req.query?.resumeText
  });
  return successResponse(res, 'Career guidance generated', { guidance });
});

// 6. Resume Analyzer
exports.analyzeResume = asyncHandler(async (req, res) => {
  const analysis = await resumeService.analyzeResume({
    userId: req.user._id,
    resumeText: req.body.resumeText,
    targetRole: req.body.targetRole
  });
  return successResponse(res, 'Resume analysis completed', { analysis });
});

// 7. Mock Interview
exports.startInterview = asyncHandler(async (req, res) => {
  const session = await interviewService.startSession({
    userId: req.user._id,
    jobRole: req.body.jobRole,
    difficulty: req.body.difficulty,
    type: req.body.type,
    questionCount: req.body.questionCount || 5
  });
  return successResponse(res, 'Mock interview session started', { session }, 201);
});

exports.evaluateInterviewAnswer = asyncHandler(async (req, res) => {
  const result = await interviewService.evaluateAnswer({
    userId: req.user._id,
    sessionId: req.params.sessionId,
    questionIndex: req.body.questionIndex,
    answer: req.body.answer
  });
  return successResponse(res, 'Interview answer evaluated', result);
});

// 8. Smart Notes
exports.generateSmartNote = asyncHandler(async (req, res) => {
  const result = await smartNotesService.generateSmartNote({
    userId: req.user._id,
    content: req.body.content,
    lessonId: req.body.lessonId,
    noteId: req.body.noteId
  });
  return successResponse(res, 'Smart note summary generated', result, 201);
});

// 9. Flashcard Generator
exports.generateFlashcards = asyncHandler(async (req, res) => {
  const result = await flashcardService.generateDeck({
    userId: req.user._id,
    topic: req.body.topic,
    lessonId: req.body.lessonId,
    count: req.body.count
  });
  return successResponse(res, 'AI Flashcards generated', result, 201);
});
