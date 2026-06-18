/**
 * MONGODB CONNECTION CONFIGURATION
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
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      family: 4,
      // SSL bypass for Render
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
    });

    isConnected = true;
    retryCount = 0;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    return conn;
    
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    
    // Try fallback without SSL
    if (error.message.includes('SSL') || error.message.includes('tls')) {
      console.log('🔑 SSL error. Trying fallback...');
      try {
        const fallbackConn = await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 30000,
          socketTimeoutMS: 60000,
          family: 4,
          tls: false,
        });
        isConnected = true;
        console.log(`✅ MongoDB connected (fallback): ${fallbackConn.connection.host}`);
        return fallbackConn;
      } catch (fallbackError) {
        console.error('❌ Fallback failed:', fallbackError.message);
      }
    }
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      const delay = retryCount * 10000;
      console.log(`🔄 Retrying in ${delay/1000}s... (Attempt ${retryCount}/${MAX_RETRIES})`);
      setTimeout(connectDB, delay);
    } else {
      console.error('❌ Max retries reached. Failed to connect to MongoDB.');
    }
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('✅ MongoDB reconnected');
});

module.exports = { connectDB, mongoose };
