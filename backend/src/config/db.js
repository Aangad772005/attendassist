const mongoose = require('mongoose');
const config = require('./env');

const MAX_RETRIES = 3;
const RETRY_INTERVAL_MS = 5000;

let currentRetries = 0;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    currentRetries = 0; // Reset retries on successful connection
  } catch (error) {
    currentRetries++;
    console.error(`❌ MongoDB connection error (attempt ${currentRetries}/${MAX_RETRIES}):`, error.message);

    if (currentRetries < MAX_RETRIES) {
      console.log(`Retrying connection in ${RETRY_INTERVAL_MS / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL_MS));
      return connectDB();
    } else {
      console.error('❌ Failed to connect to database after maximum retries. Shutting down...');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
