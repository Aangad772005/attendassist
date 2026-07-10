const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    institution: {
      type: String,
      trim: true,
      default: null,
    },
    semester: {
      type: Number,
      min: [1, 'Semester must be at least 1'],
      max: [12, 'Semester cannot exceed 12'],
      default: null,
    },
    defaultRequiredAttendance: {
      type: Number,
      min: [1, 'Required attendance must be at least 1%'],
      max: [100, 'Required attendance cannot exceed 100%'],
      default: 75,
    },
    aiInsightCache: {
      type: String,
      default: null,
    },
    aiInsightHash: {
      type: String,
      default: null,
    },
    aiInsightGeneratedAt: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook: Hash password if modified
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash') || !this.passwordHash) return;

  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});


// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// TTL Index for Soft-Deleted User documents (expires after 30 days)
userSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 });

const User = mongoose.model('User', userSchema);

module.exports = User;
