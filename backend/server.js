const dotenv = require('dotenv');

// Handle uncaught exceptions first
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, ':', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Load environment variables before anything else
dotenv.config();

const config = require('./src/config/env');
const connectDB = require('./src/config/db');
const app = require('./app');

// Connect to MongoDB
connectDB();

const server = app.listen(config.port, () => {
  console.log(`\n  ⬡  AttendAssist API`);
  console.log(`  ───────────────────────`);
  console.log(`  Environment : ${config.env}`);
  console.log(`  Port        : ${config.port}`);
  console.log(`  Client URL  : ${config.client.url}`);
  console.log(`  ───────────────────────\n`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down gracefully...');
  console.error(err.name, ':', err.message);
  server.close(() => {
    process.exit(1);
  });
});

