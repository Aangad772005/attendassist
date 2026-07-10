const { body } = require('express-validator');
const ATTENDANCE = require('../constants/attendance');

const markAttendanceRules = [
  body('subjectId')
    .trim()
    .notEmpty().withMessage('Subject ID is required')
    .isMongoId().withMessage('Invalid Subject ID format'),
  body('date')
    .notEmpty().withMessage('Attendance date is required')
    .isISO8601().withMessage('Please enter a valid ISO 8601 date string (e.g. YYYY-MM-DD)'),
  body('status')
    .trim()
    .notEmpty().withMessage('Attendance status is required')
    .isIn(Object.values(ATTENDANCE.STATUS)).withMessage('Status must be either: present, absent, or cancelled'),
  body('note')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Note cannot exceed 200 characters')
    .escape(),
];

const updateAttendanceRules = [
  body('status')
    .optional()
    .trim()
    .isIn(Object.values(ATTENDANCE.STATUS)).withMessage('Status must be either: present, absent, or cancelled'),
  body('note')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Note cannot exceed 200 characters')
    .escape(),
];

module.exports = {
  markAttendanceRules,
  updateAttendanceRules,
};
