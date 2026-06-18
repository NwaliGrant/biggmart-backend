/**
 * MONGODB CONNECTION CONFIGURATION
 * With retry logic and better error handling
 */

const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 5;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      family: 4,
    });

    isConnected = true;
    retryCount = 0;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      const delay = retryCount * 5000;
      console.log(`🔄 Retrying connection in ${delay/1000} seconds... (Attempt ${retryCount}/${MAX_RETRIES})`);
      setTimeout(() => {
        connectDB();
      }, delay);
    } else {
      console.error('❌ Max retries reached. Failed to connect to MongoDB.');
      console.error('💡 Please check:');
      console.error('   1. Your internet connection');
      console.error('   2. Your IP is whitelisted in MongoDB Atlas');
      console.error('   3. Your connection string is correct');
      console.error('   4. MongoDB Atlas is running');
    }
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('✅ MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error: ${err.message}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

module.exports = { connectDB, mongoose };
