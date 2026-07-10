const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const passport = require('passport');

const config = require('./src/config/env');
const configurePassport = require('./src/config/passport');
const { apiLimiter } = require('./src/config/rateLimit');
const errorHandler = require('./src/middleware/errorHandler');
const ApiError = require('./src/utils/ApiError');

// Import routers
const healthRouter = require('./src/routes/health');
const authRouter = require('./src/routes/auth');
const usersRouter = require('./src/routes/users');
const subjectsRouter = require('./src/routes/subjects');
const attendanceRouter = require('./src/routes/attendance');
const dashboardRouter = require('./src/routes/dashboard');
const analyticsRouter = require('./src/routes/analytics');
const aiRouter = require('./src/routes/ai');
const calculatorRouter = require('./src/routes/calculator');

const app = express();

// ──────────────────────────────────────
// Security headers
// ──────────────────────────────────────
app.use(helmet());

// ──────────────────────────────────────
// CORS — allow frontend origin with credentials
// ──────────────────────────────────────
app.use(cors({
  origin: config.client.url,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ──────────────────────────────────────
// Body parsing + compression
// ──────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ──────────────────────────────────────
// Request logging
// ──────────────────────────────────────
if (config.env !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ──────────────────────────────────────
// Initialize Passport
// ──────────────────────────────────────
app.use(passport.initialize());
configurePassport();

// ──────────────────────────────────────
// Apply global API rate limit
// ──────────────────────────────────────
app.use('/api', apiLimiter);

// ──────────────────────────────────────
// Routes
// ──────────────────────────────────────
app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/subjects', subjectsRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/calculator', calculatorRouter);





// Temporary root route to verify the server is alive
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AttendAssist API is running',
    data: {
      version: '1.0.0',
      environment: config.env,
    },
  });
});

// ──────────────────────────────────────
// 404 handler — catches all unmatched routes
// ──────────────────────────────────────
app.use((req, res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
});

// ──────────────────────────────────────
// Global error handling middleware (must be last)
// ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;


