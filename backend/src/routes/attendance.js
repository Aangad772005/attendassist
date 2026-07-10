const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const {
  markAttendanceRules,
  updateAttendanceRules,
} = require('../validators/attendanceValidators');

const router = express.Router();

// Require session verification on all attendance routes
router.use(authenticate);

router.post('/', markAttendanceRules, validate, attendanceController.markAttendance);
router.get('/', attendanceController.getAttendanceHistory);

router.get('/:recordId', attendanceController.getRecordById);
router.patch('/:recordId', updateAttendanceRules, validate, attendanceController.updateRecord);
router.delete('/:recordId', attendanceController.deleteRecord);

module.exports = router;
