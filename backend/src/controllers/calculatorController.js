const subjectService = require('../services/subjectService');
const calculatorService = require('../services/calculatorService');
const ApiResponse = require('../utils/ApiResponse');
const HTTP = require('../constants/http');
const ApiError = require('../utils/ApiError');
const asyncWrapper = require('../utils/asyncWrapper');

const getSafeAbsences = asyncWrapper(async (req, res) => {
  const { subjectId } = req.params;

  // 1. Fetch subject details with stats
  const subject = await subjectService.getSubjectById(req.user._id, subjectId);
  const stats = subject.stats;

  const result = {
    subjectId: subject._id,
    name: subject.name,
    requiredAttendance: subject.requiredAttendance,
    currentPercentage: stats.percentage,
    status: stats.status,
    safeAbsences: stats.safeAbsences,
    consecutiveClassesNeeded: stats.classesNeededToReachRequired,
  };

  return ApiResponse.success(res, HTTP.OK, 'Safe absences stats compiled successfully', result);
});

const getProjection = asyncWrapper(async (req, res) => {
  const { subjectId } = req.params;
  const { futureTotal, futurePlanned } = req.body;

  // Validation checks
  if (futureTotal === undefined || futurePlanned === undefined) {
    throw ApiError.badRequest('Both futureTotal and futurePlanned parameters are required.');
  }

  const fTotal = parseInt(futureTotal, 10);
  const fPlanned = parseInt(futurePlanned, 10);

  if (isNaN(fTotal) || isNaN(fPlanned) || fTotal < 0 || fPlanned < 0) {
    throw ApiError.badRequest('Future total and planned values must be non-negative integers.');
  }

  if (fPlanned > fTotal) {
    throw ApiError.badRequest('Future planned attendances cannot exceed future total sessions.');
  }

  // 1. Fetch subject details with stats
  const subject = await subjectService.getSubjectById(req.user._id, subjectId);
  const stats = subject.stats;

  // 2. Perform projection
  const projection = calculatorService.calculateProjection(
    stats.attendedClasses,
    stats.totalClasses,
    fTotal,
    fPlanned,
    subject.requiredAttendance
  );

  return ApiResponse.success(res, HTTP.OK, 'Attendance projection calculated successfully', {
    subjectId: subject._id,
    name: subject.name,
    requiredAttendance: subject.requiredAttendance,
    ...projection,
  });
});

module.exports = {
  getSafeAbsences,
  getProjection,
};
