class PromptBuilder {
  /**
   * Builds the prompt for the overall dashboard greeting — a punchy one-liner.
   * @param {object} stats - Overall stats.
   * @param {Array} slackingSubjects - Array of subjects below required thresholds.
   * @param {string} userName - User's full name (first name will be extracted).
   * @param {string} greetingPeriod - 'morning' | 'afternoon' | 'evening'.
   * @returns {string} Fully formulated prompt.
   */
  buildDashboardPrompt(stats, slackingSubjects, userName, greetingPeriod) {
    // Use first name only
    const firstName = (userName || 'Student').trim().split(/\s+/)[0];

    // Build qualitative context — NO numbers exposed to Gemini
    let situationDesc;
    if (!stats.totalClasses || stats.overallStatus === 'no_data') {
      situationDesc = 'has not started logging classes yet — their attendance journey is just beginning';
    } else if (stats.overallStatus === 'safe' && slackingSubjects.length === 0) {
      situationDesc = 'is absolutely crushing it — all subjects are comfortably above required attendance';
    } else if (stats.overallStatus === 'safe' && slackingSubjects.length > 0) {
      situationDesc = 'is doing well overall but has a couple of subjects quietly slipping behind';
    } else if (stats.overallStatus === 'warning') {
      situationDesc = 'is drifting dangerously close to the attendance danger zone';
    } else if (stats.overallStatus === 'critical') {
      situationDesc = 'is in a critical attendance situation — they need to get to class now';
    } else {
      situationDesc = 'is in serious trouble with attendance — it is an emergency and every class counts';
    }

    const slackingNames = slackingSubjects.length > 0
      ? slackingSubjects.map(s => s.name).join(', ')
      : null;

    return `You are AttendAssist's AI greeter for a student attendance dashboard app. Generate one single punchy greeting line.

Student first name: ${firstName}
Situation: The student ${situationDesc}.${slackingNames ? `\nSubjects falling behind: ${slackingNames}` : ''}
Time of day: ${greetingPeriod}

STRICT RULES:
1. HARD LIMIT: 20 words maximum. Count carefully before responding.
2. Use ONLY the first name "${firstName}" — never a full name.
3. Do NOT mention any numbers, percentages, or counts. Qualitative language only.
4. VARY the format every time. Pick one style randomly from: rhetorical question, playful roast, hype comment, urgent wake-up call, emoji-led one-liner, fitness/sports metaphor, pop-culture reference, challenge. Never default to "Good morning/afternoon/evening".
5. Match the energy to the situation: urgent and direct for danger/critical, gently nudging for warning, hype/celebratory for safe, curious/inviting for no data.
6. Return ONLY the greeting line. No explanations, no JSON, no markdown.

Style reference examples (do NOT copy these — create something fresh and different each time):
- "Oi ${firstName}, your classes won't attend themselves. 👀"
- "${firstName}, you're on a roll — don't even think about stopping. 🔥"
- "Every class counts, ${firstName}. Every. Single. One. 💪"
- "SOS, ${firstName} — your attendance is sending a distress signal. 🚨"
- "Slacking or striving, ${firstName}? The register doesn't lie. 🏁"
- "The comeback arc starts now, ${firstName}. Let's go. ⚡"`;
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
