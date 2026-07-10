const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { authLimiter } = require('../config/rateLimit');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('../validators/authValidators');

const router = express.Router();

// Apply auth rate limiting globally to this module
router.use(authLimiter);

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/status', authenticate, authController.status);

router.post('/forgot-password', forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, authController.resetPassword);

// Google OAuth initiating route
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false, // We use custom cookie JWT, no session
  })
);

// Google OAuth callback redirect handler
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:4200/login?success=false&reason=oauth_cancelled',
    session: false,
  }),
  authController.googleCallback
);

module.exports = router;
