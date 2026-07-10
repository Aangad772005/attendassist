const MESSAGES = {
  AUTH: {
    REGISTER_SUCCESS: 'Account created successfully',
    LOGIN_SUCCESS: 'Welcome back!',
    LOGOUT_SUCCESS: 'You have been logged out',
    UNAUTHORIZED: 'Authentication required. Please log in.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    FORBIDDEN: 'You do not have permission to access this resource.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    PASSWORD_CHANGED: 'Password updated successfully.',
    PASSWORD_RESET_SENT: 'If an account with that email exists, you will receive reset instructions shortly.',
    PASSWORD_RESET_SUCCESS: 'Your password has been successfully reset.',
    GOOGLE_OAUTH_FAILED: 'Google authentication failed.',
    EMAIL_ALREADY_EXISTS: 'This email is already registered.',
    CONFIRM_PHRASE_MISMATCH: 'Confirmation phrase did not match.',
    ACCOUNT_DELETED: 'Your account and all associated data have been permanently deleted.',
  },
  SUBJECT: {
    CREATE_SUCCESS: 'Subject created successfully',
    UPDATE_SUCCESS: 'Subject updated successfully',
    DELETE_SUCCESS: 'Subject deleted successfully',
    NOT_FOUND: 'Subject not found.',
    ARCHIVED: 'Subject archived successfully',
    RESTORED: 'Subject restored from archive',
  },
  ATTENDANCE: {
    MARK_SUCCESS: 'Attendance marked successfully',
    UPDATE_SUCCESS: 'Attendance record updated successfully',
    DELETE_SUCCESS: 'Attendance record removed.',
    DUPLICATE: 'Attendance already marked for this subject on this date',
    NOT_FOUND: 'Attendance record not found.',
    FUTURE_DATE: 'Cannot mark attendance for a future date',
  },
  AI: {
    UNAVAILABLE: 'AI insights are temporarily unavailable.',
    FALLBACK_MESSAGE: 'Welcome back. Check your subjects below to see today\'s attendance status.',
  },
  SERVER: {
    INTERNAL_ERROR: 'An unexpected error occurred.',
    HEALTHY: 'AttendAssist API is operational',
  },
};

module.exports = MESSAGES;
