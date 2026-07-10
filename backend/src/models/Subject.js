const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Subject must belong to a user'],
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      minlength: [2, 'Subject name must be at least 2 characters'],
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      trim: true,
      default: null,
    },
    color: {
      type: String,
      required: [true, 'Subject color is required'],
      trim: true,
      match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid 6-character hex color code (e.g. #FF5733)'],
    },
    requiredAttendance: {
      type: Number,
      required: [true, 'Required attendance threshold is required'],
      min: [1, 'Required attendance must be at least 1%'],
      max: [100, 'Required attendance cannot exceed 100%'],
      default: 75,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    semesterTag: {
      type: String,
      trim: true,
      default: null,
    },
    totalClasses: {
      type: Number,
      default: 0,
      min: [0, 'Total classes cannot be negative'],
    },
    attendedClasses: {
      type: Number,
      default: 0,
      min: [0, 'Attended classes cannot be negative'],
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Normalize subject code to uppercase
subjectSchema.pre('save', function () {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
});


// Indexes for query performance
subjectSchema.index({ userId: 1, isArchived: 1, deletedAt: 1 });
subjectSchema.index({ userId: 1, createdAt: -1 });
subjectSchema.index({ userId: 1, semesterTag: 1 }, { sparse: true });

// TTL Index for Soft-Deleted Subject documents (expires after 30 days)
subjectSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
