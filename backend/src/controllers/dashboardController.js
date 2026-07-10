const dashboardService = require('../services/dashboardService');
const DashboardDto = require('../dtos/dashboard.dto');
const ApiResponse = require('../utils/ApiResponse');
const HTTP = require('../constants/http');
const asyncWrapper = require('../utils/asyncWrapper');

const getDashboard = asyncWrapper(async (req, res) => {
  const dashboardData = await dashboardService.getDashboardData(req.user._id);

  return ApiResponse.success(
    res,
    HTTP.OK,
    'Dashboard statistics compiled successfully',
    DashboardDto.toPublicDashboard(dashboardData)
  );
});

module.exports = {
  getDashboard,
};
