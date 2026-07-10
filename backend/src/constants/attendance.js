const ATTENDANCE = {
  STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    CANCELLED: 'cancelled',
  },
  HEALTH: {
    SAFE: 'safe',
    WARNING: 'warning',
    CRITICAL: 'critical',
    DANGER: 'danger',
    NO_DATA: 'no_data',
  },
  THRESHOLDS: {
    DEFAULT_REQUIRED: 75,
    WARNING_OFFSET: 5,   // warning when percentage is within 5% of required
    CRITICAL_OFFSET: 10, // critical when percentage is within 10% of required
  },
};

module.exports = ATTENDANCE;
