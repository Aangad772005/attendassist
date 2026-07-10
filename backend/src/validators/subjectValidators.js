const { body } = require('express-validator');

const createSubjectRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Subject name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Subject name must be between 2 and 100 characters')
    .escape(),
  body('code')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('Course code cannot exceed 20 characters')
    .escape(),
  body('color')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^#[0-9A-F]{6}$/i).withMessage('Please enter a valid 6-character hex color (e.g. #FF5733)'),
  body('requiredAttendance')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1, max: 100 }).withMessage('Required attendance threshold must be an integer between 1 and 100'),
  body('semesterTag')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Semester tag cannot exceed 50 characters')
    .escape(),
  body('totalClasses')
    .optional()
    .isInt({ min: 0 }).withMessage('Total classes must be a non-negative integer'),
  body('attendedClasses')
    .optional()
    .isInt({ min: 0 }).withMessage('Attended classes must be a non-negative integer'),
];

const updateSubjectRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Subject name must be between 2 and 100 characters')
    .escape(),
  body('code')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('Course code cannot exceed 20 characters')
    .escape(),
  body('color')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^#[0-9A-F]{6}$/i).withMessage('Please enter a valid 6-character hex color (e.g. #FF5733)'),
  body('requiredAttendance')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1, max: 100 }).withMessage('Required attendance threshold must be an integer between 1 and 100'),
  body('semesterTag')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Semester tag cannot exceed 50 characters')
    .escape(),
  body('totalClasses')
    .optional()
    .isInt({ min: 0 }).withMessage('Total classes must be a non-negative integer'),
  body('attendedClasses')
    .optional()
    .isInt({ min: 0 }).withMessage('Attended classes must be a non-negative integer'),
];

module.exports = {
  createSubjectRules,
  updateSubjectRules,
};
