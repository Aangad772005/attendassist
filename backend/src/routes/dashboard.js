const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, dashboardController.getDashboard);

module.exports = router;
