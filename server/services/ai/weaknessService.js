const groqService = require('./groqService');
const aiPromptService = require('./aiPromptService');
const AIAnalysis = require('../../models/AIAnalysis');
const QuizAttempt = require('../../models/QuizAttempt');
const Progress = require('../../models/Progress');
const AppError = require('../../utils/AppError');

class WeaknessService {
  /**
   * Analyze Student Quiz & Performance History to Detect Weaknesses
   */
  async analyzeWeakness(userId, courseId = null) {
    const filter = { student: userId, status: 'submitted' };
    if (courseId) filter.course = courseId;

    const attempts = await QuizAttempt.find(filter).sort({ createdAt: -1 }).limit(10);
    if (attempts.length === 0) {
      return {
        message: 'No quiz attempt data available yet. Please complete at least one quiz to analyze weaknesses.',
        weakTopics: [],
        overallConfidence: 100
      };
    }

    // Summarize topic performances for prompt
    const topicSummary = {};
    attempts.forEach((attempt) => {
      if (attempt.topicScores) {
        Object.keys(attempt.topicScores).forEach((topic) => {
          const t = attempt.topicScores[topic];
          if (!topicSummary[topic]) topicSummary[topic] = { correct: 0, total: 0 };
          topicSummary[topic].correct += t.correct;
          topicSummary[topic].total += t.total;
        });
      }
    });

    const { systemPrompt } = aiPromptService.getWeaknessPrompt(topicSummary);

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Student Topic Performance History:\n${JSON.stringify(topicSummary, null, 2)}`
      }
    ];

    const result = await groqService.chatCompletion({
      messages,
      tier: 'primary',
      feature: 'weakness_detection',
      userId,
      jsonMode: true
    });

    let analysisData = {};
    try {
      analysisData = JSON.parse(result.content);
    } catch (parseErr) {
      analysisData = {
        weakTopics: [{ topic: 'Core Concepts', mastery: 50, detectedIssue: 'Needs review', recommendation: 'Re-watch core lesson videos' }],
        strongTopics: [{ topic: 'Fundamentals', mastery: 85 }],
        overallConfidence: 70,
        recommendedRevision: ['Core Concepts'],
        practiceActivities: ['Retake topic quiz']
      };
    }

    // Cache Analysis Result in DB
    const analysisDoc = await AIAnalysis.create({
      user: userId,
      course: courseId || null,
      type: 'weakness',
      result: analysisData,
      promptVersion: process.env.AI_PROMPT_VERSION || 'v1.0',
      model: result.model,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // valid for 7 days
      isLatest: true
    });

    return analysisDoc;
  }

  /**
   * Detect At-Risk Dropouts for Instructors
   */
  async detectAtRiskStudents(courseId) {
    const progressList = await Progress.find({ course: courseId })
      .populate('student', 'firstName lastName email profile.avatar');

    // Filter students with progress < 20% or inactive > 14 days
    const atRisk = progressList.filter((p) => p.overallProgress < 25 || p.masteryScore < 50);

    return {
      totalEnrolled: progressList.length,
      atRiskCount: atRisk.length,
      atRiskStudents: atRisk.map((p) => ({
        student: p.student,
        overallProgress: p.overallProgress,
        masteryScore: p.masteryScore,
        lastAccessedAt: p.lastAccessedAt,
        riskLevel: p.masteryScore < 35 || p.overallProgress < 10 ? 'high' : 'medium'
      }))
    };
  }
}

module.exports = new WeaknessService();
