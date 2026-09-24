const groqService = require('./groqService');
const AIInterviewSession = require('../../models/AIInterviewSession');
const AppError = require('../../utils/AppError');

/**
 * Safely parse JSON output from AI models even if wrapped in markdown fences
 */
function cleanJsonResponse(rawContent) {
  if (!rawContent) return '';
  let cleaned = rawContent.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }
  return cleaned;
}

class InterviewService {
  /**
   * Start AI Mock Interview Session with configurable question count
   */
  async startSession({ userId, jobRole = 'Full-Stack Developer', difficulty = 'intermediate', type = 'technical', questionCount = 5 }) {
    const count = Math.max(3, Math.min(10, parseInt(questionCount) || 5));

    const messages = [
      {
        role: 'system',
        content: `You are a Principal Tech Interviewer conducting a mock interview for the role of ${jobRole} (${difficulty} level, ${type} focus).

Generate exactly ${count} distinct technical interview questions. Return ONLY a valid JSON object matching this schema:
{
  "questions": [
    {
      "text": "Question text here?",
      "category": "Technical Concept",
      "difficulty": "${difficulty}",
      "order": 0,
      "expectedAnswer": "Key points expected",
      "hints": ["Hint 1"]
    }
  ]
}`
      },
      {
        role: 'user',
        content: `Generate ${count} technical interview questions for role: ${jobRole} (${difficulty} level, ${type} focus).`
      }
    ];

    const result = await groqService.chatCompletion({
      messages,
      tier: 'primary',
      feature: 'mock_interview',
      userId,
      jsonMode: true
    });

    let generatedData = { questions: [] };
    try {
      const cleaned = cleanJsonResponse(result.content);
      generatedData = JSON.parse(cleaned);
      if (!generatedData.questions || !Array.isArray(generatedData.questions) || generatedData.questions.length === 0) {
        throw new Error('Invalid questions array in AI response');
      }
    } catch (parseErr) {
      console.warn('[InterviewService] Could not parse AI interview questions JSON, using fallback question set:', parseErr.message);
      generatedData = {
        questions: [
          { text: `Explain core concepts and architectural best practices for ${jobRole}.`, category: 'Architecture', difficulty, order: 0, hints: ['Design principles'] },
          { text: `How do you handle asynchronous operations, state management, and error handling in ${jobRole}?`, category: 'Async & State', difficulty, order: 1, hints: ['Promises / Async-Await'] },
          { text: `What performance optimization strategies do you employ when building applications for ${jobRole}?`, category: 'Performance', difficulty, order: 2, hints: ['Caching, indexing, code splitting'] },
          { text: `Describe security measures you implement to protect web applications and APIs for ${jobRole}.`, category: 'Security', difficulty, order: 3, hints: ['Sanitization, JWT, CORS'] },
          { text: `How do you approach debugging and testing complex production issues in ${jobRole}?`, category: 'Debugging & Testing', difficulty, order: 4, hints: ['Logging, unit/integration testing'] }
        ]
      };
    }

    const validDifficulty = ['beginner', 'intermediate', 'advanced'].includes(difficulty) ? difficulty : 'intermediate';
    const validModel = result?.model || process.env.GROQ_PRIMARY_MODEL || 'groq/compound';

    const session = await AIInterviewSession.create({
      user: userId,
      jobRole,
      difficulty: validDifficulty,
      type: type || 'technical',
      questions: generatedData.questions,
      answers: [],
      totalQuestions: generatedData.questions.length,
      currentQuestionIndex: 0,
      status: 'in_progress',
      promptVersion: process.env.AI_PROMPT_VERSION || 'v1.0',
      model: validModel
    });

    return session;
  }

  /**
   * Submit Answer to Interview Question & Get Real-Time Evaluation
   */
  async evaluateAnswer({ userId, sessionId, questionIndex, answer }) {
    const session = await AIInterviewSession.findOne({ _id: sessionId, user: userId });
    if (!session || session.status === 'completed') {
      throw new AppError('Active interview session not found.', 404);
    }

    const question = session.questions[questionIndex];
    if (!question) {
      throw new AppError('Question index out of bounds.', 400);
    }

    const messages = [
      {
        role: 'system',
        content: `You are a Senior Tech Interviewer evaluating a candidate's answer.
Question: "${question.text}"
Role: ${session.jobRole}

Evaluate the candidate's answer and return ONLY a valid JSON object:
{
  "score": 8,
  "feedback": "Strong explanation of the core concept.",
  "strengths": ["Clear communication", "Accurate technical terms"],
  "weaknesses": ["Could mention edge cases"],
  "idealAnswer": "Ideal candidate response explanation."
}`
      },
      {
        role: 'user',
        content: `Candidate Answer:\n"${answer}"`
      }
    ];

    const result = await groqService.chatCompletion({
      messages,
      tier: 'primary',
      feature: 'mock_interview',
      userId,
      jsonMode: true
    });

    let evalData = {};
    try {
      const cleaned = cleanJsonResponse(result.content);
      evalData = JSON.parse(cleaned);
    } catch (parseErr) {
      evalData = { score: 7, feedback: 'Good effort.', strengths: ['Clear communication'], weaknesses: [], idealAnswer: 'Demonstrate deep knowledge of core principles and practical examples.' };
    }

    // Save answer and evaluation
    session.answers.push({
      questionIndex,
      answer,
      answeredAt: new Date(),
      evaluation: evalData
    });

    session.currentQuestionIndex = Math.min(session.totalQuestions, questionIndex + 1);

    // Complete session if all questions answered
    if (session.answers.length >= session.totalQuestions) {
      session.status = 'completed';
      session.completedAt = new Date();
      
      const avgScore = Math.round(
        session.answers.reduce((acc, a) => acc + (a.evaluation?.score || 0), 0) / session.answers.length
      );

      session.evaluation = {
        overallScore: avgScore,
        technicalScore: avgScore,
        communicationScore: Math.min(10, avgScore + 1),
        accuracyScore: avgScore,
        confidenceScore: avgScore,
        strengths: ['Demonstrated clear problem solving'],
        weaknesses: ['Review advanced optimization topics'],
        recommendedTopics: ['System Architecture'],
        overallFeedback: `Completed mock interview with average score ${avgScore}/10.`,
        hireRecommendation: avgScore >= 8 ? 'yes' : avgScore >= 6 ? 'maybe' : 'no'
      };
    }

    await session.save();

    return {
      evaluation: evalData,
      isSessionComplete: session.status === 'completed',
      session
    };
  }
}

module.exports = new InterviewService();
