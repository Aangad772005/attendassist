const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const optionalEnvVarsWithWarnings = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GEMINI_API_KEY'];

// Validate required environment variables
const missingRequired = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingRequired.length > 0) {
  console.error('\n❌ CRITICAL STARTUP ERROR: Missing required environment variables:');
  missingRequired.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('Please configure them in your .env file.\n');
  process.exit(1);
}

// Warn about missing optional but important environment variables
const missingOptional = optionalEnvVarsWithWarnings.filter(envVar => !process.env[envVar]);

if (missingOptional.length > 0) {
  console.warn('\n⚠️  STARTUP WARNING: Missing optional environment variables:');
  missingOptional.forEach(envVar => {
    console.warn(`   - ${envVar} (Some features like Google OAuth or AI Insights might fail)`);
  });
  console.warn('');
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    rememberMeExpiresIn: process.env.JWT_REMEMBER_ME_EXPIRES_IN || '30d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || null,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || null,
  },
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:4200',
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER || null,
    pass: process.env.EMAIL_PASS || null,
    from: process.env.EMAIL_FROM || 'AttendAssist <noreply@attendassist.com>',
  },
};

module.exports = Object.freeze(config);
