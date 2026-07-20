const ATTENDANCE = require('../constants/attendance');

class CalculatorService {
  /**
   * Calculates the attendance percentage.
   * @param {number} attended - Number of attended classes.
   * @param {number} total - Total classes (excluding cancelled).
   * @returns {number|null} Percentage rounded to 2 decimal places, or null if total is 0.
   */
  calculatePercentage(attended, total) {
    if (total === 0) return null;
    return Math.round((attended / total) * 10000) / 100; // Round to 2 decimal places
  }

  /**
   * Determines the attendance health status.
   * @param {number|null} percentage - Attendance percentage.
   * @param {number} required - Required attendance percentage.
   * @returns {string} Status enum.
   */
  getAttendanceStatus(percentage, required) {
    if (percentage === null) return ATTENDANCE.HEALTH.NO_DATA;

    const diff = required - percentage;

    if (diff <= 0) return ATTENDANCE.HEALTH.SAFE;
    if (diff <= ATTENDANCE.THRESHOLDS.WARNING_OFFSET) return ATTENDANCE.HEALTH.WARNING;
    if (diff <= ATTENDANCE.THRESHOLDS.CRITICAL_OFFSET) return ATTENDANCE.HEALTH.CRITICAL;
    return ATTENDANCE.HEALTH.DANGER;
  }

  /**
   * Calculates how many future classes can be missed without falling below the threshold.
   * Formula: safeAbsences = floor((attended - (required/100) * total) / (1 - required/100))
   * @param {number} attended - Number of attended classes.
   * @param {number} total - Total classes (excluding cancelled).
   * @param {number} required - Required attendance percentage.
   * @returns {number} Safe absences count (0 minimum).
   */
  calculateSafeAbsences(attended, total, required) {
    if (total === 0) return 0;
    
    const reqFactor = required / 100;
    const numerator = attended - reqFactor * total;
    const denominator = 1 - reqFactor;
    
    if (denominator === 0) return 0; // Guard against 100% threshold division

    const result = Math.floor(numerator / denominator);
    return result < 0 ? 0 : result;
  }

  /**
   * Calculates how many consecutive future classes must be attended to reach the threshold.
   * Formula: classesNeeded = ceil(((required/100) * total - attended) / (1 - required/100))
   * @param {number} attended - Number of attended classes.
   * @param {number} total - Total classes (excluding cancelled).
   * @param {number} required - Required attendance percentage.
   * @returns {number|null} Consecutive classes needed, or null if already meeting threshold.
   */
  calculateClassesNeeded(attended, total, required) {
    const percentage = this.calculatePercentage(attended, total);
    if (percentage === null) return 0;
    if (percentage >= required) return 0;

    const reqFactor = required / 100;
    const numerator = reqFactor * total - attended;
    const denominator = 1 - reqFactor;

    if (denominator === 0) return null; // Can't reach 100% easily once a class is missed

    return Math.ceil(numerator / denominator);
  }

  /**
   * Projects future attendance based on planned schedule.
   * @param {number} attended - Current attended classes.
   * @param {number} total - Current total classes (excluding cancelled).
   * @param {number} futureTotal - Planned future classes.
   * @param {number} futurePlanned - Planned future attendances.
   * @param {number} required - Required attendance percentage.
   * @returns {object} Projection result.
   */
  calculateProjection(attended, total, futureTotal, futurePlanned, required) {
    const projectedAttended = attended + futurePlanned;
    const projectedTotal = total + futureTotal;
    const projectedPercentage = this.calculatePercentage(projectedAttended, projectedTotal);
    const projectedStatus = this.getAttendanceStatus(projectedPercentage, required);

    const willMeetRequirement = projectedPercentage >= required;
    const shortfall = willMeetRequirement ? 0 : Math.round((required - projectedPercentage) * 100) / 100;

    return {
      currentPercentage: this.calculatePercentage(attended, total),
      projectedPercentage,
      projectedStatus,
      willMeetRequirement,
      shortfall,
      breakdown: {
        currentAttended: attended,
        currentTotal: total,
        futureAttended: futurePlanned,
        futureTotal,
        projectedAttended,
        projectedTotal,
      },
    };
  }

  /**
   * Aggregates stats across multiple subjects.
   * Calculates true weighted average of attendance.
   * @param {Array} subjectStatsArray - Array of individual subject stats objects.
   * @returns {object} Overall aggregate statistics.
   */
  getOverallStats(subjectStatsArray) {
    let totalClasses = 0;
    let totalAttended = 0;
    let totalAbsent = 0;
    let totalCancelled = 0;

    subjectStatsArray.forEach(stat => {
      if (stat.stats) {
        totalClasses += stat.stats.totalClasses || 0;
        totalAttended += stat.stats.attendedClasses || 0;
        totalAbsent += stat.stats.absentClasses || 0;
        totalCancelled += stat.stats.cancelledClasses || 0;
      }
    });


    const activeSubjectCount = subjectStatsArray.filter(s => !s.isArchived).length;
    const subjectCount = subjectStatsArray.length;

    // Default required threshold
    const required = 75; 
    const overallPercentage = this.calculatePercentage(totalAttended, totalClasses);
    const overallStatus = this.getAttendanceStatus(overallPercentage, required);

    return {
      overallPercentage,
      overallStatus,
      totalClasses,
      totalAttended,
      totalAbsent,
      totalCancelled,
      subjectCount,
      activeSubjectCount,
    };
  }

  /**
   * Determines the greeting period based on local/IST hours.
   * @param {Date} date - Current date object.
   * @returns {string} 'morning' | 'afternoon' | 'evening'
   */
  getGreetingPeriod(date = new Date()) {
    const hour = date.getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  /**
   * Generates a dynamic fallback greeting based on time of day.
   * @param {string} name - User's name.
   * @returns {string} Friendly greeting statement.
   */
  getFallbackMessage(name) {
    const firstName = (name || 'Student').trim().split(/\s+/)[0];
    const period = this.getGreetingPeriod();
    const messages = {
      morning: `Rise and shine, ${firstName} — those classes won't attend themselves. ☀️`,
      afternoon: `Still going, ${firstName}? Good. Keep that attendance streak alive. 💪`,
      evening: `Evening check-in, ${firstName}. How did the classes go today? 🌙`,
    };
    return messages[period];
  }
}


module.exports = new CalculatorService();
