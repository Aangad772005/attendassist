const SubjectDto = require('./subject.dto');

class AnalyticsDto {
  static toPublicOverview(subjects) {
    return SubjectDto.toPublicSubjectList(subjects);
  }

  static toPublicTrend(trendData) {
    return trendData.map(t => ({
      date: t.date,
      present: t.present,
      absent: t.absent,
      cancelled: t.cancelled,
      total: t.total,
      percentage: t.percentage,
    }));
  }

  static toPublicDistribution(dist) {
    return {
      presentCount: dist.presentCount,
      absentCount: dist.absentCount,
      cancelledCount: dist.cancelledCount,
      totalCount: dist.totalCount,
      presentPercentage: dist.presentPercentage,
      absentPercentage: dist.absentPercentage,
    };
  }

  static toPublicRanking(ranking) {
    return ranking.map(r => ({
      id: r.id,
      name: r.name,
      code: r.code,
      color: r.color,
      percentage: r.percentage,
      status: r.status,
      safeAbsences: r.safeAbsences,
      classesNeeded: r.classesNeeded,
    }));
  }
}

module.exports = AnalyticsDto;
