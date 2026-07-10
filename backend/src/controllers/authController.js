const authService = require('../services/authService');
const UserDto = require('../dtos/user.dto');
const ApiResponse = require('../utils/ApiResponse');
const HTTP = require('../constants/http');
const MESSAGES = require('../constants/messages');
const asyncWrapper = require('../utils/asyncWrapper');
const config = require('../config/env');

const register = asyncWrapper(async (req, res) => {
  const { name, email, password } = req.body;

  const { user, token, cookieOptions } = await authService.register(name, email, password);

  // Set httpOnly cookie
  res.cookie('token', token, cookieOptions);

  return ApiResponse.success(
    res,
    HTTP.CREATED,
    MESSAGES.AUTH.REGISTER_SUCCESS,
    UserDto.toPublicUser(user)
  );
});

const login = asyncWrapper(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  const { user, token, cookieOptions } = await authService.login(email, password, rememberMe);

  res.cookie('token', token, cookieOptions);

  return ApiResponse.success(
    res,
    HTTP.OK,
    MESSAGES.AUTH.LOGIN_SUCCESS,
    UserDto.toPublicUser(user)
  );
});

const logout = asyncWrapper(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'Lax',
    secure: config.env === 'production',
    path: '/',
  });

  return ApiResponse.success(res, HTTP.OK, MESSAGES.AUTH.LOGOUT_SUCCESS);
});

const forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  await authService.forgotPassword(email);

  // Always return 200/success to prevent email enumeration
  return ApiResponse.success(res, HTTP.OK, MESSAGES.AUTH.PASSWORD_RESET_SENT);
});

const resetPassword = asyncWrapper(async (req, res) => {
  const { token, newPassword } = req.body;

  await authService.resetPassword(token, newPassword);

  return ApiResponse.success(res, HTTP.OK, MESSAGES.AUTH.PASSWORD_RESET_SUCCESS);
});

const status = asyncWrapper(async (req, res) => {
  return ApiResponse.success(
    res,
    HTTP.OK,
    'Session is active',
    UserDto.toPublicUser(req.user)
  );
});

const googleCallback = asyncWrapper(async (req, res) => {
  if (!req.user) {
    return res.redirect(`${config.client.url}/login?success=false&reason=auth_failed`);
  }

  // Generate JWT and set httpOnly cookie for the social profile
  const token = authService.signToken(req.user._id);
  const cookieOptions = authService.getCookieOptions(false);

  res.cookie('token', token, cookieOptions);

  // Redirect to frontend Google callback routing handler page
  return res.redirect(`${config.client.url}/auth/google/callback?success=true`);
});

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  googleCallback,
  status,
};
