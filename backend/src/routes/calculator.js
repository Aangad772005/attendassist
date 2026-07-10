const express = require('express');
const calculatorController = require('../controllers/calculatorController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Require session verification on all calculator endpoints
router.use(authenticate);

router.get('/safe-absences/:subjectId', calculatorController.getSafeAbsences);
router.post('/projection/:subjectId', calculatorController.getProjection);

module.exports = router;
