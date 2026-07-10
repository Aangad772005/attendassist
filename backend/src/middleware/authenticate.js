const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const asyncWrapper = require('../utils/asyncWrapper');

const authenticate = asyncWrapper(async (req, res, next) => {
  // 1. Get token from cookies
  const token = req.cookies?.token;

  if (!token) {
    return next(ApiError.unauthorized('Authentication required. Please log in.'));
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // 3. Check if user still exists and is not soft-deleted
    const user = await User.findOne({ _id: decoded.id, deletedAt: null }).select('+passwordHash');


    if (!user) {
      // Clear invalid cookie
      res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'Lax',
        secure: config.env === 'production',
        path: '/',
      });
      return next(ApiError.unauthorized('User session not found or account deactivated.'));
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return next(ApiError.unauthorized('Invalid or expired token. Please log in again.'));
  }
});

module.exports = authenticate;
