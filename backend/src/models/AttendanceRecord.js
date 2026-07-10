const mongoose = require('mongoose');
const ATTENDANCE = require('../constants/attendance');

const attendanceRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Attendance record must belong to a user'],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Attendance record must reference a subject'],
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
    },
    status: {
      type: String,
      required: [true, 'Attendance status is required'],
      enum: {
        values: Object.values(ATTENDANCE.STATUS),
        message: 'Status must be either: present, absent, or cancelled',
      },
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
      default: null,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Pre-save hook: Normalize date to UTC midnight (removes time component to prevent duplicate checks failing)
attendanceRecordSchema.pre('save', function () {
  if (this.date) {
    const d = new Date(this.date);
    this.date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }
});


// Indexes for query optimization
attendanceRecordSchema.index({ subjectId: 1, date: -1, deletedAt: 1 });
attendanceRecordSchema.index({ userId: 1, date: -1, deletedAt: 1 });
attendanceRecordSchema.index({ userId: 1, subjectId: 1, deletedAt: 1 });
attendanceRecordSchema.index({ userId: 1, status: 1, date: -1 });

// Critical Unique partial index: Prevents multiple active marks for the same subject on the same date
attendanceRecordSchema.index(
  { subjectId: 1, date: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

// TTL Index for Soft-Deleted AttendanceRecord documents (expires after 30 days)
attendanceRecordSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 });

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);

module.exports = AttendanceRecord;
