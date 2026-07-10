const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subject = require('../models/Subject');
const AttendanceRecord = require('../models/AttendanceRecord');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');
const { sendPasswordResetEmail } = require('../utils/emailUtils');

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

// Helper to configure jwt cookie options
const getCookieOptions = (rememberMe = false) => {
  const maxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 7 * 24 * 60 * 60 * 1000; // 7 days

  return {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge,
  };
};

class AuthService {
  async register(name, email, password) {
    // 1. Check for duplicates
    const existingUser = await User.findOne({ email, deletedAt: null });
    if (existingUser) {
      throw ApiError.conflict('This email is already registered.');
    }

    // 2. Create user (passwordHash triggers pre-save bcrypt hashing hook)
    const newUser = await User.create({
      name,
      email,
      passwordHash: password,
    });

    const token = signToken(newUser._id);
    const cookieOptions = getCookieOptions(false);

    return { user: newUser, token, cookieOptions };
  }

  async login(email, password, rememberMe = false) {
    // 1. Fetch user + select passwordHash explicitly (since it is hidden in schema)
    const user = await User.findOne({ email, deletedAt: null }).select('+passwordHash');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    // 2. Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const token = signToken(user._id);
    const cookieOptions = getCookieOptions(rememberMe);

    // Remove passwordHash from return object
    user.passwordHash = undefined;

    return { user, token, cookieOptions };
  }

  async googleUpsert(profile) {
    const { id, displayName, emails, photos } = profile;
    const email = emails[0].value;
    const avatar = photos?.[0]?.value || null;

    // 1. Find user by googleId
    let user = await User.findOne({ googleId: id, deletedAt: null });

    if (user) {
      // Update avatar if changed
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        await user.save();
      }
      return user;
    }

    // 2. Find user by email (Account linking if registered via email previously)
    user = await User.findOne({ email, deletedAt: null });
    if (user) {
      user.googleId = id;
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      await user.save();
      return user;
    }

    // 3. Create brand new user
    user = await User.create({
      name: displayName,
      email,
      googleId: id,
      avatar,
    });

    return user;
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email, deletedAt: null });
    if (!user) {
      // Return true to prevent email harvesting/enumeration
      return true;
    }

    // 1. Generate random reset token
    const rawToken = crypto.randomBytes(32).toString('hex');

    // 2. Hash and store on User with 15 minutes expiry
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    // 3. Deliver email
    try {
      await sendPasswordResetEmail(user.email, rawToken);
    } catch (error) {
      // Cleanup token on mail failure
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      throw error;
    }

    return true;
  }

  async resetPassword(token, newPassword) {
    // 1. Hash the incoming token parameter
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find matching unexpired token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      deletedAt: null,
    }).select('+passwordHash');

    if (!user) {
      throw ApiError.unauthorized('Password reset token is invalid or has expired.');
    }

    // 3. Update password (triggers hashing pre-save hook)
    user.passwordHash = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return true;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findOne({ _id: userId, deletedAt: null }).select('+passwordHash');
    if (!user) {
      throw ApiError.notFound('User profile not found.');
    }

    // 1. Validate if user has a password (might be Google-only signup)
    if (!user.passwordHash) {
      throw ApiError.forbidden('Please configure a password via your profile settings first.');
    }

    // 2. Validate old password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.unauthorized('Current password does not match.');
    }

    // 3. Ensure they aren't setting the same password again
    if (currentPassword === newPassword) {
      throw ApiError.badRequest('New password cannot be the same as your current password.');
    }

    // 4. Update
    user.passwordHash = newPassword;
    await user.save();

    return true;
  }

  async updateProfile(userId, profileData) {
    const user = await User.findOne({ _id: userId, deletedAt: null });
    if (!user) {
      throw ApiError.notFound('User profile not found.');
    }

    // Allowed update fields
    const allowedUpdates = ['name', 'institution', 'semester', 'defaultRequiredAttendance'];
    allowedUpdates.forEach(key => {
      if (profileData[key] !== undefined) {
        user[key] = profileData[key];
      }
    });

    await user.save();
    return user;
  }

  async deleteAccount(userId) {
    const user = await User.findOne({ _id: userId, deletedAt: null });
    if (!user) {
      throw ApiError.notFound('User profile not found.');
    }

    const now = new Date();

    // 1. Soft-delete user's subjects
    await Subject.updateMany(
      { userId, deletedAt: null },
      { $set: { deletedAt: now } }
    );

    // 2. Soft-delete user's attendance records
    await AttendanceRecord.updateMany(
      { userId, deletedAt: null },
      { $set: { deletedAt: now } }
    );

    // 3. Soft-delete user account
    user.deletedAt = now;
    user.name = 'Deleted User';
    user.email = `deleted_${user._id}@attendassist.local`;
    user.googleId = undefined; // Prevents uniqueness conflicts on future registrations
    await user.save();

    return true;
  }
}

module.exports = new AuthService();
module.exports.getCookieOptions = getCookieOptions;
module.exports.signToken = signToken;
