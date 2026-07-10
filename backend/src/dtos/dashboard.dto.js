const SubjectDto = require('./subject.dto');

class DashboardDto {
  constructor(dashboard) {
    this.aiInsight = {
      insight: dashboard.aiInsight.insight,
      generatedAt: dashboard.aiInsight.generatedAt,
      cached: dashboard.aiInsight.cached,
    };
    
    this.overallStats = {
      overallPercentage: dashboard.overallStats.overallPercentage,
      overallStatus: dashboard.overallStats.overallStatus,
      totalClasses: dashboard.overallStats.totalClasses,
      totalAttended: dashboard.overallStats.totalAttended,
      totalAbsent: dashboard.overallStats.totalAbsent,
      totalCancelled: dashboard.overallStats.totalCancelled,
      subjectCount: dashboard.overallStats.subjectCount,
      activeSubjectCount: dashboard.overallStats.activeSubjectCount,
    };

    // Serialize nested entities
    this.subjects = SubjectDto.toPublicSubjectList(dashboard.subjects);
  }

  static toPublicDashboard(dashboard) {
    return new DashboardDto(dashboard);
  }
}

module.exports = DashboardDto;
