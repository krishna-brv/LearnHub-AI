const { body } = require('express-validator');

const createQuestionValidator = [
  body('quiz')
    .notEmpty().withMessage('Quiz ID is required')
    .isMongoId().withMessage('Quiz ID must be a valid MongoDB ObjectId'),
  body('type')
    .notEmpty().withMessage('Question type is required')
    .isIn(['mcq', 'multiple_select', 'true_false', 'fill_blank', 'short_answer', 'coding', 'scenario'])
    .withMessage('Invalid question type'),
  body('text')
    .trim()
    .notEmpty().withMessage('Question text is required'),
  body('topic')
    .trim()
    .notEmpty().withMessage('Topic is required for analytics'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  body('marks')
    .optional()
    .isNumeric().withMessage('Marks must be a number')
];

module.exports = {
  createQuestionValidator
};
