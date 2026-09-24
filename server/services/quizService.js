const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');

class QuizService {
  /**
   * Get All Quizzes for a Course
   */
  async getCourseQuizzes(courseId, user) {
    const filter = { course: courseId };
    
    // Non-instructors only see published quizzes
    const isInstructorOrAdmin = user && ['instructor', 'admin'].includes(user.role);
    if (!isInstructorOrAdmin) {
      filter.isPublished = true;
    }

    const quizzes = await Quiz.find(filter)
      .populate('createdBy', 'firstName lastName profile.avatar')
      .sort({ createdAt: -1 });

    return quizzes;
  }

  /**
   * Get Quiz Details by ID
   */
  async getQuizById(quizId, user) {
    const quiz = await Quiz.findById(quizId)
      .populate('course', 'title status instructor')
      .populate('module', 'title')
      .populate('lesson', 'title');

    if (!quiz) {
      throw new AppError('Quiz not found.', 404);
    }

    const isOwnerOrAdmin = user && (quiz.createdBy.toString() === user._id.toString() || user.role === 'admin');

    if (!quiz.isPublished && !isOwnerOrAdmin) {
      throw new AppError('This quiz is not currently available.', 403);
    }

    return quiz;
  }

  /**
   * Create Quiz (Instructor)
   */
  async createQuiz(creatorId, data) {
    const {
      course,
      module,
      lesson,
      title,
      description,
      instructions,
      timeLimit,
      attemptLimit,
      passingScore,
      negativeMarking,
      negativeMarkValue,
      randomizeQuestions,
      randomizeOptions,
      showCorrectAnswers,
      showExplanations,
      isPublished
    } = data;

    // Verify course exists
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      throw new AppError('Course not found.', 404);
    }

    const quiz = await Quiz.create({
      course,
      module: module || null,
      lesson: lesson || null,
      title,
      description: description || '',
      instructions: instructions || '',
      timeLimit: timeLimit || 0,
      attemptLimit: attemptLimit || 0,
      passingScore: passingScore || 60,
      negativeMarking: negativeMarking || false,
      negativeMarkValue: negativeMarkValue || 0,
      randomizeQuestions: randomizeQuestions || false,
      randomizeOptions: randomizeOptions || false,
      showCorrectAnswers: showCorrectAnswers !== undefined ? showCorrectAnswers : true,
      showExplanations: showExplanations !== undefined ? showExplanations : true,
      isPublished: isPublished || false,
      createdBy: creatorId
    });

    return quiz;
  }

  /**
   * Update Quiz (Instructor Owner)
   */
  async updateQuiz(quizId, userId, userRole, data) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new AppError('Quiz not found.', 404);
    }

    if (quiz.createdBy.toString() !== userId.toString() && userRole !== 'admin') {
      throw new AppError('Unauthorized to update this quiz.', 403);
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, { $set: data }, { new: true, runValidators: true });
    return updatedQuiz;
  }

  /**
   * Delete Quiz
   */
  async deleteQuiz(quizId, userId, userRole) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new AppError('Quiz not found.', 404);
    }

    if (quiz.createdBy.toString() !== userId.toString() && userRole !== 'admin') {
      throw new AppError('Unauthorized to delete this quiz.', 403);
    }

    // Delete related questions
    await Question.deleteMany({ quiz: quizId });
    await Quiz.findByIdAndDelete(quizId);

    return { message: 'Quiz and its questions deleted successfully.' };
  }
}

module.exports = new QuizService();
