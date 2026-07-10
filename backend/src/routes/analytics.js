const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Require session verification on all analytics endpoints
router.use(authenticate);

router.get('/subjects', analyticsController.getSubjectOverview);
router.get('/trend', analyticsController.getTrend);
router.get('/distribution', analyticsController.getDistribution);
router.get('/ranking', analyticsController.getSubjectRanking);

module.exports = router;
