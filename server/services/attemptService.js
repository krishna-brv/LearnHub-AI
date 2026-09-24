const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const LearningActivity = require('../models/LearningActivity');
const XPTransaction = require('../models/XPTransaction');
const AppError = require('../utils/AppError');

class AttemptService {
  /**
   * Start Quiz Attempt
   */
  async startAttempt(studentId, quizId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isPublished) {
      throw new AppError('Quiz not found or not available.', 404);
    }

    // Verify student is enrolled in course
    const isEnrolled = await Enrollment.exists({
      student: studentId,
      course: quiz.course,
      status: { $in: ['active', 'completed'] }
    });

    if (!isEnrolled) {
      throw new AppError('You must be enrolled in the course to attempt this quiz.', 403);
    }

    // Check attempt limits
    const existingAttempts = await QuizAttempt.countDocuments({
      student: studentId,
      quiz: quizId,
      status: { $in: ['submitted', 'timed_out'] }
    });

    if (quiz.attemptLimit > 0 && existingAttempts >= quiz.attemptLimit) {
      throw new AppError(`You have reached the maximum attempt limit (${quiz.attemptLimit}) for this quiz.`, 400);
    }

    // Check if student has an existing in_progress attempt
    let activeAttempt = await QuizAttempt.findOne({
      student: studentId,
      quiz: quizId,
      status: 'in_progress'
    });

    if (activeAttempt) {
      // Check if active attempt has timed out
      if (quiz.timeLimit > 0) {
        const elapsedMinutes = (new Date().getTime() - new Date(activeAttempt.startedAt).getTime()) / (1000 * 60);
        if (elapsedMinutes > quiz.timeLimit + 2) { // 2 minute grace window
          activeAttempt.status = 'timed_out';
          await activeAttempt.save();
          activeAttempt = null; // force new attempt or rejection
        }
      }
    }

    if (!activeAttempt) {
      // Fetch questions
      let questions = await Question.find({ quiz: quizId });
      if (questions.length === 0) {
        throw new AppError('This quiz has no questions yet.', 400);
      }

      if (quiz.randomizeQuestions) {
        questions = questions.sort(() => Math.random() - 0.5);
      }

      const questionIds = questions.map((q) => q._id);
      const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

      activeAttempt = await QuizAttempt.create({
        student: studentId,
        quiz: quizId,
        course: quiz.course,
        questions: questionIds,
        answers: [],
        totalMarks,
        attemptNumber: existingAttempts + 1,
        startedAt: new Date(),
        status: 'in_progress'
      });
    }

    // Fetch questions sanitized for student (no correct answers)
    const questions = await Question.find({ _id: { $in: activeAttempt.questions } });
    const questionsMap = new Map(questions.map((q) => [q._id.toString(), q]));
    
    const orderedQuestions = activeAttempt.questions.map((qId) => {
      const q = questionsMap.get(qId.toString());
      const qObj = q ? q.toObject() : {};
      
      if (quiz.randomizeOptions && qObj.options && qObj.options.length > 0) {
        qObj.options = qObj.options.sort(() => Math.random() - 0.5);
      }

      if (qObj.options) {
        qObj.options = qObj.options.map((opt) => ({ text: opt.text }));
      }

      delete qObj.correctAnswer;
      delete qObj.acceptableAnswers;
      delete qObj.explanation;
      delete qObj.codeSolution;

      return qObj;
    });

    return {
      attempt: activeAttempt,
      quiz: {
        title: quiz.title,
        timeLimit: quiz.timeLimit,
        totalMarks: activeAttempt.totalMarks,
        questionCount: orderedQuestions.length,
        instructions: quiz.instructions
      },
      questions: orderedQuestions
    };
  }

  /**
   * Auto-Save Answer during Quiz Attempt
   */
  async saveAnswer(attemptId, studentId, questionId, answerData) {
    const attempt = await QuizAttempt.findOne({ _id: attemptId, student: studentId, status: 'in_progress' });
    if (!attempt) {
      throw new AppError('Active quiz attempt not found.', 404);
    }

    const { selectedOptions, textAnswer, codeAnswer } = answerData;

    const existingAnswerIndex = attempt.answers.findIndex((a) => a.question.toString() === questionId.toString());

    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex].selectedOptions = selectedOptions || [];
      attempt.answers[existingAnswerIndex].textAnswer = textAnswer || '';
      attempt.answers[existingAnswerIndex].codeAnswer = codeAnswer || '';
      attempt.answers[existingAnswerIndex].answeredAt = new Date();
    } else {
      attempt.answers.push({
        question: questionId,
        selectedOptions: selectedOptions || [],
        textAnswer: textAnswer || '',
        codeAnswer: codeAnswer || '',
        answeredAt: new Date()
      });
    }

    attempt.autoSaved = true;
    await attempt.save();

    return { message: 'Answer saved successfully' };
  }

  /**
   * Submit Attempt & Deterministic Server-Side Scoring Engine
   */
  async submitAttempt(attemptId, studentId) {
    const attempt = await QuizAttempt.findOne({ _id: attemptId, student: studentId });
    if (!attempt) {
      throw new AppError('Attempt record not found.', 404);
    }

    if (attempt.status === 'submitted') {
      throw new AppError('This attempt has already been submitted.', 400);
    }

    const quiz = await Quiz.findById(attempt.quiz);
    if (!quiz) {
      throw new AppError('Quiz not found.', 404);
    }

    // Fetch full question bank with correct answers
    const questions = await Question.find({ _id: { $in: attempt.questions } });
    const questionsMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let totalScore = 0;
    const topicTracker = {}; // topic -> { correct: 0, total: 0 }

    // Deterministic Grading Engine
    const gradedAnswers = attempt.questions.map((qId) => {
      const q = questionsMap.get(qId.toString());
      if (!q) return null;

      const studentAns = attempt.answers.find((a) => a.question.toString() === q._id.toString()) || {
        selectedOptions: [],
        textAnswer: '',
        codeAnswer: ''
      };

      let isCorrect = false;
      let marksAwarded = 0;

      // Track topic totals
      if (!topicTracker[q.topic]) {
        topicTracker[q.topic] = { correct: 0, total: 0 };
      }
      topicTracker[q.topic].total += 1;

      // Evaluate by question type
      if (['mcq', 'true_false'].includes(q.type)) {
        const correctIndices = q.options.map((opt, idx) => (opt.isCorrect ? idx : -1)).filter((idx) => idx !== -1);
        const selected = studentAns.selectedOptions || [];
        if (selected.length > 0 && selected[0] === correctIndices[0]) {
          isCorrect = true;
        }
      } else if (q.type === 'multiple_select') {
        const correctIndices = q.options.map((opt, idx) => (opt.isCorrect ? idx : -1)).filter((idx) => idx !== -1);
        const selected = (studentAns.selectedOptions || []).sort();
        const correctSorted = correctIndices.sort();
        if (selected.length === correctSorted.length && selected.every((val, index) => val === correctSorted[index])) {
          isCorrect = true;
        }
      } else if (['fill_blank', 'short_answer'].includes(q.type)) {
        const studentText = (studentAns.textAnswer || '').trim().toLowerCase();
        const mainCorrect = (q.correctAnswer || '').trim().toLowerCase();
        const altCorrect = (q.acceptableAnswers || []).map((a) => a.trim().toLowerCase());

        if (studentText && (studentText === mainCorrect || altCorrect.includes(studentText))) {
          isCorrect = true;
        }
      } else if (q.type === 'coding') {
        // Simple exact match check on clean code (future: docker sandbox execution)
        const studentCode = (studentAns.codeAnswer || '').trim();
        const solutionCode = (q.codeSolution || '').trim();
        if (studentCode && (studentCode === solutionCode || studentCode.includes(solutionCode))) {
          isCorrect = true;
        }
      }

      if (isCorrect) {
        marksAwarded = q.marks;
        totalScore += marksAwarded;
        topicTracker[q.topic].correct += 1;
      } else if (quiz.negativeMarking && (studentAns.selectedOptions.length > 0 || studentAns.textAnswer || studentAns.codeAnswer)) {
        totalScore -= quiz.negativeMarkValue;
      }

      return {
        question: q._id,
        selectedOptions: studentAns.selectedOptions || [],
        textAnswer: studentAns.textAnswer || '',
        codeAnswer: studentAns.codeAnswer || '',
        isCorrect,
        marksAwarded,
        answeredAt: studentAns.answeredAt || new Date()
      };
    });

    const finalScore = Math.max(0, totalScore);
    const percentage = Math.round((finalScore / (attempt.totalMarks || 1)) * 100);
    const passed = percentage >= quiz.passingScore;

    // Calculate topicScores object
    const topicScores = {};
    Object.keys(topicTracker).forEach((topic) => {
      const t = topicTracker[topic];
      topicScores[topic] = {
        correct: t.correct,
        total: t.total,
        percentage: Math.round((t.correct / t.total) * 100)
      };
    });

    const now = new Date();
    const timeSpentSeconds = Math.round((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000);

    attempt.answers = gradedAnswers;
    attempt.score = finalScore;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.topicScores = topicScores;
    attempt.submittedAt = now;
    attempt.timeSpent = timeSpentSeconds;
    attempt.status = 'submitted';

    await attempt.save();

    // Log Activity for Heatmap & Analytics
    await LearningActivity.create({
      student: studentId,
      course: attempt.course,
      type: 'quiz_complete',
      duration: timeSpentSeconds,
      metadata: { quizId: quiz._id, score: finalScore, percentage, passed },
      date: now
    });

    // Update Student Progress
    const attempts = await QuizAttempt.find({ student: studentId, course: attempt.course, status: 'submitted' });
    const quizAvg = Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / (attempts.length || 1));

    let progress = await Progress.findOne({ student: studentId, course: attempt.course });
    if (progress) {
      progress.quizAverage = quizAvg;
      progress.totalQuizzesTaken = attempts.length;
      progress.masteryScore = Math.round(
        progress.overallProgress * 0.4 + quizAvg * 0.3 + progress.assignmentAverage * 0.3
      );
      await progress.save();
    }

    // Award XP if passed
    if (passed) {
      const xpAmount = percentage === 100 ? 75 : 30;
      const xpType = percentage === 100 ? 'quiz_perfect' : 'quiz_pass';
      try {
        await XPTransaction.addXP(
          studentId,
          xpAmount,
          xpType,
          `Passed quiz: ${quiz.title} (${percentage}%)`,
          quiz._id,
          'Quiz',
          `Quiz completion bonus (${percentage}%)`
        );
      } catch (xpErr) {
        console.warn('⚠️ Could not award quiz XP:', xpErr.message);
      }
    }

    // Send In-App Notification
    try {
      const notificationService = require('./notificationService');
      await notificationService.notify({
        user: studentId,
        type: 'quiz',
        title: passed ? 'Quiz Passed! 🎉' : 'Quiz Result Available',
        message: `You scored ${percentage}% on "${quiz.title}". Status: ${passed ? 'PASSED' : 'NEEDS PRACTICE'}.`,
        link: `/quiz/${quiz._id}`,
        priority: passed ? 'medium' : 'low'
      });
    } catch (notifErr) {
      console.warn('⚠️ Could not send quiz notification:', notifErr.message);
    }

    return {
      attemptId: attempt._id,
      score: finalScore,
      totalMarks: attempt.totalMarks,
      percentage,
      passed,
      passingScore: quiz.passingScore,
      topicScores,
      timeSpent: timeSpentSeconds,
      showExplanations: quiz.showExplanations
    };
  }

  /**
   * Get Student Quiz Attempt History
   */
  async getStudentAttemptHistory(studentId, quizId) {
    const attempts = await QuizAttempt.find({ student: studentId, quiz: quizId })
      .sort({ createdAt: -1 });

    return attempts;
  }

  /**
   * Get Single Attempt Breakdown Result
   */
  async getAttemptDetails(attemptId, studentId, userRole = 'student') {
    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quiz', 'title description passingScore showCorrectAnswers showExplanations')
      .populate('questions');

    if (!attempt) {
      throw new AppError('Attempt record not found.', 404);
    }

    if (attempt.student.toString() !== studentId.toString() && userRole !== 'admin') {
      throw new AppError('Unauthorized to view this attempt result.', 403);
    }

    return attempt;
  }
}

module.exports = new AttemptService();
