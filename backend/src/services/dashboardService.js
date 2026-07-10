const User = require('../models/User');
const calculatorService = require('./calculatorService');
const subjectService = require('./subjectService');
const geminiService = require('./geminiService');

class DashboardService {
  async getDashboardData(userId) {
    // 1. Get all subjects with stats using our subjectService
    const subjects = await subjectService.getAllSubjects(userId, { includeArchived: false });

    // 2. Compute overall stats across all active subjects
    const overallStats = calculatorService.getOverallStats(subjects);

    // 3. Query user to get name and retrieve AI insights via geminiService
    const user = await User.findOne({ _id: userId, deletedAt: null });
    const aiInsight = await geminiService.getOrCachedInsight(
      userId,
      overallStats,
      subjects,
      user?.name || 'Student'
    );

    const AttendanceRecord = require('../models/AttendanceRecord');

    // 4. Fetch recent activity (last 10 records)
    const recentActivity = await AttendanceRecord.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('subjectId', 'name code color');

    // Format recentActivity for frontend (rename subjectId to subject)
    const formattedRecentActivity = recentActivity.map(r => {
      const obj = r.toObject();
      obj.subject = obj.subjectId;
      delete obj.subjectId;
      // Also format date to YYYY-MM-DD
      obj.date = obj.date.toISOString().split('T')[0];
      return obj;
    });

    // 5. Compute weekly trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      weeklyTrend.push({ date: dateStr, present: 0, absent: 0, cancelled: 0 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const recentRecordsForTrend = await AttendanceRecord.find({
      userId,
      deletedAt: null,
      date: { $gte: sevenDaysAgo }
    });

    recentRecordsForTrend.forEach(record => {
      const dateStr = record.date.toISOString().split('T')[0];
      const trendDay = weeklyTrend.find(t => t.date === dateStr);
      if (trendDay) {
        if (record.status === 'present') trendDay.present++;
        else if (record.status === 'absent') trendDay.absent++;
        else if (record.status === 'cancelled') trendDay.cancelled++;
      }
    });

    return {
      aiInsight,
      overallStats,
      subjects,
      recentActivity: formattedRecentActivity,
      weeklyTrend
    };
  }
}

module.exports = new DashboardService();
