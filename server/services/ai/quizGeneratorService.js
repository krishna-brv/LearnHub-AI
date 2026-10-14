const groqService = require('./groqService');
const aiPromptService = require('./aiPromptService');
const questionService = require('../questionService');
const AppError = require('../../utils/AppError');

class QuizGeneratorService {
  /**
   * Generate AI Quiz Questions for a Quiz
   */
  async generateQuestions({ userId, quizId, topic, difficulty = 'medium', count = 3, type = 'mcq' }) {
    const targetCount = parseInt(count, 10) || 3;
    const { systemPrompt } = aiPromptService.getQuizGeneratorPrompt(topic, difficulty, targetCount, type);

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Generate ${targetCount} ${difficulty} level questions on topic "${topic}" of type "${type}".`
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

    const rawList = generatedData.questions || [];
    const limitedQuestions = rawList.slice(0, targetCount);

    // Auto-import generated questions into quiz if quizId is provided
    let importedQuestions = [];
    if (quizId && limitedQuestions.length > 0) {
      const formattedForImport = limitedQuestions.map((q) => ({
        ...q,
        isAIGenerated: true,
        aiPromptVersion: process.env.AI_PROMPT_VERSION || 'v1.0'
      }));

      importedQuestions = await questionService.bulkCreateQuestions(quizId, formattedForImport);
    }

    const finalQuestions = (importedQuestions.length > 0 ? importedQuestions : limitedQuestions).slice(0, targetCount);

    return {
      generatedCount: finalQuestions.length,
      questions: finalQuestions,
      isFallback: result.isFallback
    };
  }
}

module.exports = new QuizGeneratorService();
