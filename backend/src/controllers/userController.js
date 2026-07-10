const authService = require('../services/authService');
const UserDto = require('../dtos/user.dto');
const ApiResponse = require('../utils/ApiResponse');
const HTTP = require('../constants/http');
const MESSAGES = require('../constants/messages');
const asyncWrapper = require('../utils/asyncWrapper');
const config = require('../config/env');

const getProfile = asyncWrapper(async (req, res) => {
  // req.user populated by authenticate middleware
  return ApiResponse.success(
    res,
    HTTP.OK,
    'Profile fetched successfully',
    UserDto.toPublicUser(req.user)
  );
});

const updateProfile = asyncWrapper(async (req, res) => {
  const updatedUser = await authService.updateProfile(req.user._id, req.body);

  return ApiResponse.success(
    res,
    HTTP.OK,
    'Profile updated successfully',
    UserDto.toPublicUser(updatedUser)
  );
});

const changePassword = asyncWrapper(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(req.user._id, currentPassword, newPassword);

  return ApiResponse.success(res, HTTP.OK, MESSAGES.AUTH.PASSWORD_CHANGED);
});

const deleteAccount = asyncWrapper(async (req, res) => {
  await authService.deleteAccount(req.user._id);

  // Clear cookie session
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'Lax',
    secure: config.env === 'production',
    path: '/',
  });

  return ApiResponse.success(res, HTTP.OK, MESSAGES.AUTH.ACCOUNT_DELETED);
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};
