class PromptBuilder {
  /**
   * Builds the prompt for the overall dashboard greeting insight.
   * @param {object} stats - Overall stats.
   * @param {Array} slackingSubjects - Array of subjects below required thresholds.
   * @param {string} userName - User's name.
   * @param {string} greetingPeriod - 'morning' | 'afternoon' | 'evening'.
   * @returns {string} Fully formulated prompt.
   */
  buildDashboardPrompt(stats, slackingSubjects, userName, greetingPeriod) {
    const slackingStr = slackingSubjects.length > 0
      ? slackingSubjects.map(s => `${s.name} (${s.code || 'No Code'}): Current ${s.stats.percentage}%, Needs ${s.requiredAttendance}% (Needs ${s.stats.classesNeededToReachRequired} consecutive attendances)`).join('\n')
      : 'None! The student is meeting all thresholds.';

    return `You are AttendAssist, a supportive and motivational university attendance coach.
The student's name is ${userName || 'Student'}.
It is currently ${greetingPeriod}.

Here are their overall stats:
- Attendance Rate: ${stats.overallPercentage !== null ? `${stats.overallPercentage}%` : 'No classes logged yet'}
- Overall Health: ${stats.overallStatus} (Status options: safe, warning, critical, danger, no_data)
- Total Classes logged: ${stats.totalClasses} (excluding cancelled sessions)

Here are the subjects where their attendance is currently slacking (below the required threshold):
${slackingStr}

INSTRUCTIONS:
1. Write a short, highly engaging greeting and insight message (2-3 sentences max).
2. Start with a friendly "Good ${greetingPeriod}, ${userName}!" or similar warm opening.
3. Call out the worst slacking subject (if any) and mention how many consecutive classes they need to attend to recover.
4. If they have no slacking subjects, congratulate them warmly and motivate them to keep the streak going.
5. WARNING: DO NOT calculate or verify any percentages or integers yourself. The numbers provided above are mathematically correct. Trust them completely.
6. Return only the natural language message. Do not include any JSON formats, markdown block tags, or calculations. Keep it conversational.`;
  }

  /**
   * Builds the prompt for advice on a specific subject.
   * @param {object} subject - Subject details with stats.
   * @param {string} userName - User's name.
   * @returns {string} Fully formulated prompt.
   */
  buildSubjectAdvicePrompt(subject, userName) {
    const stats = subject.stats;
    const safeAbsencesText = stats.safeAbsences > 0
      ? `They can miss up to ${stats.safeAbsences} class(es) safely without dropping below their threshold.`
      : `They cannot miss any classes! They must attend at least ${stats.classesNeededToReachRequired} consecutive class(es) to recover.`;

    return `You are AttendAssist, a supportive university attendance advisor.
Provide subject-specific attendance advice for the student ${userName || 'Student'}.

Course Details:
- Subject: ${subject.name} (${subject.code || 'No Code'})
- Current Attendance: ${stats.percentage !== null ? `${stats.percentage}%` : 'No logs yet'} (Required: ${subject.requiredAttendance}%)
- Record: ${stats.attendedClasses} Attended, ${stats.absentClasses} Absent, ${stats.cancelledClasses} Cancelled
- Status: ${stats.status}
- Warning Stats: ${safeAbsencesText}

INSTRUCTIONS:
1. Write a 2-3 sentence motivational advice paragraph.
2. Provide concrete recommendations based on whether they have safe bunk opportunities or if they need to attend consecutive classes.
3. Be supportive and direct. Do not calculate any numbers. Trust the calculations provided.
4. Return only the plain text response. No headings or code blocks.`;
  }
}

module.exports = new PromptBuilder();
