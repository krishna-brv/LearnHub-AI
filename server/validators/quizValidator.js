const { body } = require('express-validator');

const createQuizValidator = [
  body('course')
    .notEmpty().withMessage('Course ID is required')
    .isMongoId().withMessage('Course ID must be a valid MongoDB ObjectId'),
  body('title')
    .trim()
    .notEmpty().withMessage('Quiz title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Quiz title must be between 3 and 200 characters'),
  body('passingScore')
    .optional()
    .isNumeric().withMessage('Passing score must be a percentage number (0-100)'),
  body('timeLimit')
    .optional()
    .isNumeric().withMessage('Time limit must be minutes as a number'),
  body('attemptLimit')
    .optional()
    .isNumeric().withMessage('Attempt limit must be a number')
];

const updateQuizValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Quiz title must be between 3 and 200 characters'),
  body('passingScore')
    .optional()
    .isNumeric().withMessage('Passing score must be a number')
];

module.exports = {
  createQuizValidator,
  updateQuizValidator
};
