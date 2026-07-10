const express = require('express');
const aiController = require('../controllers/aiController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Require session verification on all AI endpoints
router.use(authenticate);

router.get('/advice/:subjectId', aiController.getSubjectAdvice);
router.post('/regenerate', aiController.regenerateInsight);

module.exports = router;
