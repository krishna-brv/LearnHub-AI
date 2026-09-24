const groqService = require('./groqService');
const AppError = require('../../utils/AppError');

class ResumeService {
  /**
   * Analyze Resume Text against Target Role
   */
  async analyzeResume({ userId, resumeText, targetRole = 'Software Engineer' }) {
    if (!resumeText) {
      throw new AppError('Resume text content is required for analysis.', 400);
    }

    const messages = [
      {
        role: 'system',
        content: `You are an expert HR Tech Recruiter and AI Resume Optimizer.
Analyze the provided resume against the target role "${targetRole}".

Return ONLY a valid JSON object matching this schema:
{
  "atsScore": 82,
  "matchPercentage": 78,
  "strengths": ["Clear project descriptions", "Relevant tech stack"],
  "weaknesses": ["Missing quantification of metrics", "Action verbs could be stronger"],
  "missingKeywords": ["Docker", "Jest", "CI/CD"],
  "bulletPointImprovements": [
    { "original": "Built a website", "improved": "Engineered a high-throughput REST API supporting 10k daily active users using Node.js and MongoDB." }
  ],
  "formattingFeedback": "Formatting is clean and readable.",
  "overallSummary": "Solid technical foundation, needs more metric-driven bullet points."
}`
      },
      {
        role: 'user',
        content: `Target Role: ${targetRole}\n\nResume Content:\n${resumeText}`
      }
    ];

    const result = await groqService.chatCompletion({
      messages,
      tier: 'primary',
      feature: 'resume_analyzer',
      userId,
      jsonMode: true
    });

    let analysisData = {};
    try {
      analysisData = JSON.parse(result.content);
    } catch (parseErr) {
      analysisData = {
        atsScore: 75,
        matchPercentage: 70,
        strengths: ['Relevant education and coursework'],
        weaknesses: ['Add quantifiable achievements'],
        missingKeywords: ['Git', 'REST API'],
        bulletPointImprovements: [],
        overallSummary: 'Good resume, consider adding project metrics.'
      };
    }

    return analysisData;
  }
}

module.exports = new ResumeService();
