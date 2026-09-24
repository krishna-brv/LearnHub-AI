const { body } = require('express-validator');

const createAssignmentValidator = [
  body('course')
    .notEmpty().withMessage('Course ID is required')
    .isMongoId().withMessage('Course ID must be a valid MongoDB ObjectId'),
  body('title')
    .trim()
    .notEmpty().withMessage('Assignment title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('instructions')
    .trim()
    .notEmpty().withMessage('Instructions are required'),
  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Deadline must be a valid date'),
  body('maxMarks')
    .notEmpty().withMessage('Max marks is required')
    .isNumeric().withMessage('Max marks must be a number')
];

const gradeSubmissionValidator = [
  body('grade')
    .notEmpty().withMessage('Grade is required')
    .isNumeric().withMessage('Grade must be a number'),
  body('feedback')
    .optional()
    .trim()
];

module.exports = {
  createAssignmentValidator,
  gradeSubmissionValidator
};
