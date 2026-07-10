const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./env');
const authService = require('../services/authService');

const configurePassport = () => {
  if (!config.google.clientId || !config.google.clientSecret) {
    console.warn('⚠️  Passport: Google OAuth credentials missing. OAuth flows will fail at runtime.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
        proxy: true, // Necessary if server sits behind proxy like Render or Cloudflare
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await authService.googleUpsert(profile);
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
};

// Passport session serialization is NOT needed since we use custom JWT token cookies,
// but we initialize strategy callbacks here.
module.exports = configurePassport;
