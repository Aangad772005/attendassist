class SubjectDto {
  constructor(subject) {
    this.id = subject._id || subject.id;
    this.name = subject.name;
    this.code = subject.code;
    this.color = subject.color;
    this.requiredAttendance = subject.requiredAttendance;
    this.isArchived = subject.isArchived;
    this.semesterTag = subject.semesterTag;
    this.createdAt = subject.createdAt;
    this.totalClasses = subject.totalClasses || 0;
    this.attendedClasses = subject.attendedClasses || 0;
    
    if (subject.stats) {
      this.stats = {
        totalClasses: subject.stats.totalClasses,
        attendedClasses: subject.stats.attendedClasses,
        absentClasses: subject.stats.absentClasses,
        cancelledClasses: subject.stats.cancelledClasses,
        percentage: subject.stats.percentage,
        status: subject.stats.status,
        safeAbsences: subject.stats.safeAbsences,
        classesNeededToReachRequired: subject.stats.classesNeededToReachRequired,
      };
    }
  }

  static toPublicSubject(subject) {
    return new SubjectDto(subject);
  }

  static toPublicSubjectList(subjects) {
    return subjects.map(s => new SubjectDto(s));
  }
}

module.exports = SubjectDto;
