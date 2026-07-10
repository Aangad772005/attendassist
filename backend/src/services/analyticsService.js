const mongoose = require('mongoose');
const AttendanceRecord = require('../models/AttendanceRecord');
const Subject = require('../models/Subject');
const subjectService = require('./subjectService');
const calculatorService = require('./calculatorService');

class AnalyticsService {
  async getSubjectOverview(userId) {
    // Reuses the aggregation logic from subjectService to fetch active subjects
    return subjectService.getAllSubjects(userId, { includeArchived: false });
  }

  async getTrend(userId, options = {}) {
    const rangeDays = parseInt(options.rangeDays, 10) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays + 1);
    startDate.setUTCHours(0, 0, 0, 0);

    const trendData = await AttendanceRecord.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deletedAt: null,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Fill gaps for dates that have zero attendance records logged
    const formattedTrend = [];
    const tempDate = new Date(startDate);

    for (let i = 0; i < rangeDays; i++) {
      const dateStr = tempDate.toISOString().split('T')[0];
      const match = trendData.find(t => t._id === dateStr);

      const present = match ? match.present : 0;
      const absent = match ? match.absent : 0;
      const total = present + absent;
      const percentage = total > 0 ? calculatorService.calculatePercentage(present, total) : null;

      formattedTrend.push({
        date: dateStr,
        present,
        absent,
        cancelled: match ? match.cancelled : 0,
        total,
        percentage, // Can be null if no classes occurred, frontend sparkline will interpolate
      });

      tempDate.setDate(tempDate.getDate() + 1);
    }

    return formattedTrend;
  }

  async getDistribution(userId) {
    const distribution = await AttendanceRecord.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      present: 0,
      absent: 0,
      cancelled: 0,
      total: 0,
      totalActive: 0, // Present + Absent
    };

    distribution.forEach(d => {
      if (d._id === 'present') result.present = d.count;
      if (d._id === 'absent') result.absent = d.count;
      if (d._id === 'cancelled') result.cancelled = d.count;
    });

    result.total = result.present + result.absent + result.cancelled;
    result.totalActive = result.present + result.absent;

    return {
      presentCount: result.present,
      absentCount: result.absent,
      cancelledCount: result.cancelled,
      totalCount: result.total,
      presentPercentage: result.totalActive > 0 ? Math.round((result.present / result.totalActive) * 10000) / 100 : 0,
      absentPercentage: result.totalActive > 0 ? Math.round((result.absent / result.totalActive) * 10000) / 100 : 0,
    };
  }

  async getSubjectRanking(userId) {
    const subjects = await this.getSubjectOverview(userId);

    // Rank from lowest attendance percentage to highest attendance percentage
    // (helps students identify their worst subjects immediately)
    return subjects
      .filter(s => s.stats.percentage !== null)
      .map(s => ({
        id: s._id || s.id,
        name: s.name,
        code: s.code,
        color: s.color,
        percentage: s.stats.percentage,
        status: s.stats.status,
        safeAbsences: s.stats.safeAbsences,
        classesNeeded: s.stats.classesNeededToReachRequired,
      }))
      .sort((a, b) => a.percentage - b.percentage);
  }
}

module.exports = new AnalyticsService();
