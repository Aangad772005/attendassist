const analyticsService = require('../services/analyticsService');
const AnalyticsDto = require('../dtos/analytics.dto');
const ApiResponse = require('../utils/ApiResponse');
const HTTP = require('../constants/http');
const asyncWrapper = require('../utils/asyncWrapper');

const getSubjectOverview = asyncWrapper(async (req, res) => {
  const data = await analyticsService.getSubjectOverview(req.user._id);

  return ApiResponse.success(
    res,
    HTTP.OK,
    'Subject overview metrics fetched successfully',
    AnalyticsDto.toPublicOverview(data)
  );
});

const getTrend = asyncWrapper(async (req, res) => {
  const { rangeDays } = req.query;
  const data = await analyticsService.getTrend(req.user._id, { rangeDays });

  return ApiResponse.success(
    res,
    HTTP.OK,
    'Attendance trend metrics fetched successfully',
    AnalyticsDto.toPublicTrend(data)
  );
});

const getDistribution = asyncWrapper(async (req, res) => {
  const data = await analyticsService.getDistribution(req.user._id);

  return ApiResponse.success(
    res,
    HTTP.OK,
    'Attendance status distribution metrics fetched successfully',
    AnalyticsDto.toPublicDistribution(data)
  );
});

const getSubjectRanking = asyncWrapper(async (req, res) => {
  const data = await analyticsService.getSubjectRanking(req.user._id);

  return ApiResponse.success(
    res,
    HTTP.OK,
    'Subject attendance ranking fetched successfully',
    AnalyticsDto.toPublicRanking(data)
  );
});

module.exports = {
  getSubjectOverview,
  getTrend,
  getDistribution,
  getSubjectRanking,
};
