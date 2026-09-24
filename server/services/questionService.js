const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const AppError = require('../utils/AppError');

class QuestionService {
  /**
   * Create Question in Question Bank
   */
  async createQuestion(data) {
    const quiz = await Quiz.findById(data.quiz);
    if (!quiz) {
      throw new AppError('Quiz not found.', 404);
    }

    const maxOrder = await Question.findOne({ quiz: data.quiz }).sort({ order: -1 });
    const order = data.order !== undefined ? data.order : (maxOrder ? maxOrder.order + 1 : 0);

    const question = await Question.create({
      quiz: data.quiz,
      type: data.type,
      text: data.text,
      options: data.options || [],
      correctAnswer: data.correctAnswer || '',
      acceptableAnswers: data.acceptableAnswers || [],
      explanation: data.explanation || '',
      difficulty: data.difficulty || 'medium',
      topic: data.topic,
      learningObjective: data.learningObjective || '',
      marks: data.marks !== undefined ? data.marks : 1,
      order,
      isAIGenerated: data.isAIGenerated || false,
      aiPromptVersion: data.aiPromptVersion || '',
      codeTemplate: data.codeTemplate || '',
      codeSolution: data.codeSolution || '',
      codeLanguage: data.codeLanguage || '',
      testCases: data.testCases || [],
      scenarioContext: data.scenarioContext || '',
      hints: data.hints || [],
      tags: data.tags || []
    });

    // Update Quiz denormalized question count and total marks
    const questions = await Question.find({ quiz: data.quiz });
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    await Quiz.findByIdAndUpdate(data.quiz, {
      questionCount: questions.length,
      totalMarks
    });

    return question;
  }

  /**
   * Bulk Create Questions (for AI Quiz Generator import)
   */
  async bulkCreateQuestions(quizId, questionsArray) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new AppError('Quiz not found.', 404);
    }

    const preparedQuestions = questionsArray.map((q, idx) => ({
      ...q,
      quiz: quizId,
      order: idx
    }));

    const createdQuestions = await Question.insertMany(preparedQuestions);

    // Update Quiz totals
    const allQuestions = await Question.find({ quiz: quizId });
    const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks, 0);
    await Quiz.findByIdAndUpdate(quizId, {
      questionCount: allQuestions.length,
      totalMarks
    });

    return createdQuestions;
  }

  /**
   * Get Questions for a Quiz (with role-based security filter)
   */
  async getQuizQuestions(quizId, user) {
    const isInstructorOrAdmin = user && ['instructor', 'admin'].includes(user.role);

    const questions = await Question.find({ quiz: quizId }).sort({ order: 1 });

    if (isInstructorOrAdmin) {
      return questions;
    }

    // Sanitize questions for student attempt (hide correct answers & solutions)
    const sanitized = questions.map((q) => {
      const qObj = q.toObject();
      if (qObj.options) {
        qObj.options = qObj.options.map((opt) => ({
          text: opt.text
        }));
      }
      delete qObj.correctAnswer;
      delete qObj.acceptableAnswers;
      delete qObj.explanation;
      delete qObj.codeSolution;
      return qObj;
    });

    return sanitized;
  }

  /**
   * Update Question
   */
  async updateQuestion(questionId, data) {
    const question = await Question.findByIdAndUpdate(questionId, { $set: data }, { new: true, runValidators: true });
    if (!question) {
      throw new AppError('Question not found.', 404);
    }

    // Update Quiz totals
    const questions = await Question.find({ quiz: question.quiz });
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    await Quiz.findByIdAndUpdate(question.quiz, { totalMarks });

    return question;
  }

  /**
   * Delete Question
   */
  async deleteQuestion(questionId) {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new AppError('Question not found.', 404);
    }

    const quizId = question.quiz;
    await Question.findByIdAndDelete(questionId);

    // Update Quiz totals
    const questions = await Question.find({ quiz: quizId });
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    await Quiz.findByIdAndUpdate(quizId, {
      questionCount: questions.length,
      totalMarks
    });

    return { message: 'Question deleted successfully.' };
  }
}

module.exports = new QuestionService();
