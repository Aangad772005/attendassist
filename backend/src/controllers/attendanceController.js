const attendanceService = require('../services/attendanceService');
const AttendanceRecordDto = require('../dtos/attendanceRecord.dto');
const ApiResponse = require('../utils/ApiResponse');
const HTTP = require('../constants/http');
const MESSAGES = require('../constants/messages');
const asyncWrapper = require('../utils/asyncWrapper');

const markAttendance = asyncWrapper(async (req, res) => {
  const record = await attendanceService.markAttendance(req.user._id, req.body);

  return ApiResponse.success(
    res,
    HTTP.CREATED,
    MESSAGES.ATTENDANCE.MARK_SUCCESS,
    AttendanceRecordDto.toPublicRecord(record)
  );
});

const getAttendanceHistory = asyncWrapper(async (req, res) => {
  const { subjectId, status, startDate, endDate, page, limit } = req.query;

  const { records, total, page: currentPage, limit: currentLimit } =
    await attendanceService.getAttendanceHistory(
      req.user._id,
      { subjectId, status, startDate, endDate },
      { page, limit }
    );

  return ApiResponse.paginated(
    res,
    HTTP.OK,
    MESSAGES.SERVER.HEALTHY, // Reusing healthy message for data queries
    AttendanceRecordDto.toPublicRecordList(records),
    currentPage,
    currentLimit,
    total
  );
});

const getRecordById = asyncWrapper(async (req, res) => {
  const { recordId } = req.params;

  const record = await attendanceService.getRecordById(req.user._id, recordId);

  return ApiResponse.success(
    res,
    HTTP.OK,
    'Attendance record fetched successfully',
    AttendanceRecordDto.toPublicRecord(record)
  );
});

const updateRecord = asyncWrapper(async (req, res) => {
  const { recordId } = req.params;

  const record = await attendanceService.updateRecord(req.user._id, recordId, req.body);

  return ApiResponse.success(
    res,
    HTTP.OK,
    MESSAGES.ATTENDANCE.UPDATE_SUCCESS,
    AttendanceRecordDto.toPublicRecord(record)
  );
});

const deleteRecord = asyncWrapper(async (req, res) => {
  const { recordId } = req.params;

  await attendanceService.deleteRecord(req.user._id, recordId);

  return ApiResponse.success(res, HTTP.OK, MESSAGES.ATTENDANCE.DELETE_SUCCESS);
});

module.exports = {
  markAttendance,
  getAttendanceHistory,
  getRecordById,
  updateRecord,
  deleteRecord,
};
