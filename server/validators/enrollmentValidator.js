const { body } = require('express-validator');

const enrollCourseValidator = [
  body('courseId')
    .notEmpty().withMessage('courseId is required')
    .isMongoId().withMessage('courseId must be a valid MongoDB ObjectId')
];

module.exports = {
  enrollCourseValidator
};
