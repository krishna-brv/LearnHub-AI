const groqService = require('./groqService');
const aiPromptService = require('./aiPromptService');
const questionService = require('../questionService');
const AppError = require('../../utils/AppError');

class QuizGeneratorService {
  /**
   * Generate AI Quiz Questions for a Quiz
   */
  async generateQuestions({ userId, quizId, topic, difficulty = 'medium', count = 5, type = 'mcq' }) {
    const { systemPrompt } = aiPromptService.getQuizGeneratorPrompt(topic, difficulty, count, type);

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Generate ${count} ${difficulty} level questions on topic "${topic}" of type "${type}".`
      }
    ];

    // Fast model for quick quiz generation
    const result = await groqService.chatCompletion({
      messages,
      tier: 'fast',
      feature: 'quiz_generator',
      userId,
      jsonMode: true
    });

    let generatedData = { questions: [] };
    try {
      generatedData = JSON.parse(result.content);
    } catch (parseErr) {
      console.warn('⚠️ Could not parse Groq Quiz JSON, using fallback question.');
      generatedData = {
        questions: [
          {
            type: 'mcq',
            text: `What is the core principle of ${topic}?`,
            topic,
            difficulty,
            marks: 1,
            options: [
              { text: 'Core Execution Flow', isCorrect: true, explanation: 'Primary fundamental concept' },
              { text: 'Irrelevant Option', isCorrect: false, explanation: 'Incorrect concept' }
            ],
            explanation: 'Underlying foundation of the topic.'
          }
        ]
      };
    }

    // Auto-import generated questions into quiz if quizId is provided
    let importedQuestions = [];
    if (quizId && generatedData.questions && generatedData.questions.length > 0) {
      const formattedForImport = generatedData.questions.map((q) => ({
        ...q,
        isAIGenerated: true,
        aiPromptVersion: process.env.AI_PROMPT_VERSION || 'v1.0'
      }));

      importedQuestions = await questionService.bulkCreateQuestions(quizId, formattedForImport);
    }

    return {
      generatedCount: generatedData.questions ? generatedData.questions.length : 0,
      questions: importedQuestions.length > 0 ? importedQuestions : generatedData.questions,
      isFallback: result.isFallback
    };
  }
}

module.exports = new QuizGeneratorService();
