const express = require('express');
const ApiResponse = require('../utils/ApiResponse');
const HTTP = require('../constants/http');
const MESSAGES = require('../constants/messages');
const config = require('../config/env');

const router = express.Router();

router.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: config.env,
  };

  return ApiResponse.success(res, HTTP.OK, MESSAGES.SERVER.HEALTHY, healthData);
});

module.exports = router;
