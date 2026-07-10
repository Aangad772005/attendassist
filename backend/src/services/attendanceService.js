const mongoose = require('mongoose');
const AttendanceRecord = require('../models/AttendanceRecord');
const Subject = require('../models/Subject');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class AttendanceService {
  /**
   * Helper to invalidate the user's AI insights cache
   * @param {string} userId - User's ObjectId.
   */
  async _invalidateAiCache(userId) {
    await User.updateOne(
      { _id: userId },
      { $set: { aiInsightHash: null } }
    );
  }

  async markAttendance(userId, data) {
    const { subjectId, date, status, note } = data;

    // 1. Verify subject exists and belongs to the user
    const subject = await Subject.findOne({ _id: subjectId, userId, deletedAt: null });
    if (!subject) {
      throw ApiError.notFound('Subject not found.');
    }

    // 2. Normalize date to UTC midnight
    const incomingDate = new Date(date);
    const normalizedDate = new Date(
      Date.UTC(incomingDate.getUTCFullYear(), incomingDate.getUTCMonth(), incomingDate.getUTCDate())
    );

    // Guard against future dates
    const today = new Date();
    const normalizedToday = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );
    if (normalizedDate > normalizedToday) {
      throw ApiError.badRequest('Cannot mark attendance for a future date.');
    }

    // 4. Create record
    const record = await AttendanceRecord.create({
      userId,
      subjectId,
      date: normalizedDate,
      status,
      note: note || null,
    });

    // 4b. Increment subject counts
    let inc = {};
    if (status === 'present') {
      inc = { totalClasses: 1, attendedClasses: 1 };
    } else if (status === 'absent') {
      inc = { totalClasses: 1 };
    }
    
    if (Object.keys(inc).length > 0) {
      await Subject.updateOne({ _id: subjectId }, { $inc: inc });
    }

    // 5. Invalidate AI Insight Cache
    await this._invalidateAiCache(userId);

    // Populate subject metadata for frontend
    const populated = await record.populate({
      path: 'subjectId',
      select: 'name code color',
    });

    return populated;
  }

  async getAttendanceHistory(userId, filters = {}, pagination = {}) {
    const query = {
      userId,
      deletedAt: null,
    };

    // Filter by specific subject
    if (filters.subjectId) {
      if (!mongoose.Types.ObjectId.isValid(filters.subjectId)) {
        throw ApiError.badRequest('Invalid Subject ID format.');
      }
      query.subjectId = filters.subjectId;
    }

    // Filter by specific status
    if (filters.status) {
      query.status = filters.status;
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        query.date.$gte = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        query.date.$lte = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
      }
    }

    // Pagination setup
    const page = parseInt(pagination.page, 10) || 1;
    const limit = Math.min(parseInt(pagination.limit, 10) || 50, 200); // Caps limit at 200
    const skip = (page - 1) * limit;

    const total = await AttendanceRecord.countDocuments(query);
    
    const records = await AttendanceRecord.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'subjectId',
        select: 'name code color',
      });

    return { records, total, page, limit };
  }

  async getRecordById(userId, recordId) {
    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      throw ApiError.badRequest('Invalid Attendance Record ID format.');
    }

    const record = await AttendanceRecord.findOne({ _id: recordId, deletedAt: null }).populate({
      path: 'subjectId',
      select: 'name code color',
    });

    if (!record) {
      throw ApiError.notFound('Attendance record not found.');
    }

    if (record.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to access this resource.');
    }

    return record;
  }

  async updateRecord(userId, recordId, updateData) {
    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      throw ApiError.badRequest('Invalid Attendance Record ID format.');
    }

    const record = await AttendanceRecord.findOne({ _id: recordId, deletedAt: null });
    if (!record) {
      throw ApiError.notFound('Attendance record not found.');
    }

    if (record.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to access this resource.');
    }

    // Allowed updates
    const allowedUpdates = ['status', 'note'];
    let changed = false;

    allowedUpdates.forEach(key => {
      if (updateData[key] !== undefined && record[key] !== updateData[key]) {
        record[key] = updateData[key];
        changed = true;
      }
    });

    if (changed) {
      record.editedAt = new Date();
      await record.save();
      await this._invalidateAiCache(userId);
    }

    const populated = await record.populate({
      path: 'subjectId',
      select: 'name code color',
    });

    return populated;
  }

  async deleteRecord(userId, recordId) {
    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      throw ApiError.badRequest('Invalid Attendance Record ID format.');
    }

    const record = await AttendanceRecord.findOne({ _id: recordId, deletedAt: null });
    if (!record) {
      throw ApiError.notFound('Attendance record not found.');
    }

    if (record.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to access this resource.');
    }

    // Soft delete
    record.deletedAt = new Date();
    await record.save();
    
    // Invalidate AI cache
    await this._invalidateAiCache(userId);

    return true;
  }
}

module.exports = new AttendanceService();
