const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const User = require('../models/User');
const calculatorService = require('./calculatorService');
const ApiError = require('../utils/ApiError');
const COLORS = require('../constants/colors');

class SubjectService {
  /**
   * Helper to fetch subjects with computed stats from direct fields.
   * @param {string} userId - User's ObjectId.
   * @param {object} matchQuery - Custom filter queries for Subjects match stage.
   * @returns {Array} List of subjects with stats.
   */
  async _getSubjectsWithStats(userId, matchQuery) {
    const subjects = await Subject.find({
      userId,
      deletedAt: null,
      ...matchQuery,
    }).lean();

    // Compute stats from direct fields
    return subjects.map(subj => {
      const total = subj.totalClasses || 0;
      const attended = subj.attendedClasses || 0;
      const absent = total - attended;

      const percentage = calculatorService.calculatePercentage(attended, total);
      const status = calculatorService.getAttendanceStatus(percentage, subj.requiredAttendance);
      const safeAbsences = calculatorService.calculateSafeAbsences(attended, total, subj.requiredAttendance);
      const classesNeededToReachRequired = calculatorService.calculateClassesNeeded(attended, total, subj.requiredAttendance);

      return {
        ...subj,
        stats: {
          totalClasses: total,
          attendedClasses: attended,
          absentClasses: absent < 0 ? 0 : absent,
          cancelledClasses: 0,
          percentage,
          status,
          safeAbsences,
          classesNeededToReachRequired,
        },
      };
    });
  }

  async createSubject(userId, subjectData) {
    // 1. Resolve required attendance threshold
    if (!subjectData.requiredAttendance) {
      const user = await User.findById(userId);
      subjectData.requiredAttendance = user?.defaultRequiredAttendance || 75;
    }

    // 2. Assign default pastel color if not provided
    if (!subjectData.color) {
      // Count existing user subjects (including deleted/archived) to cycle through the color palette
      const existingCount = await Subject.countDocuments({ userId });
      subjectData.color = COLORS[existingCount % COLORS.length];
    }

    const newSubject = await Subject.create({
      userId,
      ...subjectData,
    });

    // Reroute back through stats calculator so return payload has correct stats
    const withStats = await this._getSubjectsWithStats(userId, { _id: newSubject._id });
    return withStats[0];
  }

  async getAllSubjects(userId, options = {}) {
    const matchQuery = {};

    if (!options.includeArchived) {
      matchQuery.isArchived = false;
    }

    let subjects = await this._getSubjectsWithStats(userId, matchQuery);

    // Apply sorting
    const sort = options.sort || 'createdAt_desc';
    if (sort === 'name_asc') {
      subjects.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'attendance_asc') {
      subjects.sort((a, b) => {
        const aPct = a.stats.percentage === null ? -1 : a.stats.percentage;
        const bPct = b.stats.percentage === null ? -1 : b.stats.percentage;
        return aPct - bPct;
      });
    } else if (sort === 'attendance_desc') {
      subjects.sort((a, b) => {
        const aPct = a.stats.percentage === null ? -1 : a.stats.percentage;
        const bPct = b.stats.percentage === null ? -1 : b.stats.percentage;
        return bPct - aPct;
      });
    } else {
      // Default: createdAt_desc
      subjects.sort((a, b) => b.createdAt - a.createdAt);
    }

    return subjects;
  }

  async getSubjectById(userId, subjectId) {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      throw ApiError.badRequest('Invalid Subject ID format.');
    }

    const subject = await Subject.findOne({ _id: subjectId, deletedAt: null });
    if (!subject) {
      throw ApiError.notFound('Subject not found.');
    }

    if (subject.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to access this resource.');
    }

    const withStats = await this._getSubjectsWithStats(userId, {
      _id: new mongoose.Types.ObjectId(subjectId),
    });

    return withStats[0];
  }


  async updateSubject(userId, subjectId, updateData) {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      throw ApiError.badRequest('Invalid Subject ID format.');
    }

    const subject = await Subject.findOne({ _id: subjectId, deletedAt: null });
    if (!subject) {
      throw ApiError.notFound('Subject not found.');
    }

    if (subject.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to access this resource.');
    }


    // 2. Perform update on permitted fields
    const allowedUpdates = ['name', 'code', 'color', 'requiredAttendance', 'semesterTag', 'totalClasses', 'attendedClasses'];
    allowedUpdates.forEach(key => {
      if (updateData[key] !== undefined) {
        subject[key] = updateData[key];
      }
    });

    await subject.save();

    // Reroute back through stats calculator
    const withStats = await this._getSubjectsWithStats(userId, { _id: subject._id });
    return withStats[0];
  }

  async deleteSubject(userId, subjectId) {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      throw ApiError.badRequest('Invalid Subject ID format.');
    }

    const subject = await Subject.findOne({ _id: subjectId, deletedAt: null });
    if (!subject) {
      throw ApiError.notFound('Subject not found.');
    }

    if (subject.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to access this resource.');
    }


    const now = new Date();

    // Soft delete subject
    subject.deletedAt = now;
    await subject.save();

    // 3. Clear user's AI insights cache (forces recalculation on next dashboard check)
    await User.updateOne(
      { _id: userId },
      { $set: { aiInsightHash: null } }
    );

    return true;
  }

  async toggleArchive(userId, subjectId) {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      throw ApiError.badRequest('Invalid Subject ID format.');
    }

    const subject = await Subject.findOne({ _id: subjectId, deletedAt: null });
    if (!subject) {
      throw ApiError.notFound('Subject not found.');
    }

    if (subject.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to access this resource.');
    }


    subject.isArchived = !subject.isArchived;
    await subject.save();

    return subject;
  }

  /**
   * Quick mark: increments totalClasses by 1, and attendedClasses by 1 if attended.
   */
  async quickMark(userId, subjectId, attended) {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      throw ApiError.badRequest('Invalid Subject ID format.');
    }

    const subject = await Subject.findOne({ _id: subjectId, deletedAt: null });
    if (!subject) {
      throw ApiError.notFound('Subject not found.');
    }

    if (subject.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not have permission to access this resource.');
    }

    subject.totalClasses += 1;
    if (attended) {
      subject.attendedClasses += 1;
    }
    await subject.save();

    const withStats = await this._getSubjectsWithStats(userId, { _id: subject._id });
    return withStats[0];
  }
}

module.exports = new SubjectService();
