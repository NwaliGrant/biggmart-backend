/**
 * THE BIGGMART - EXPRESS.JS SERVER
 * Production-ready for Render
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Import MongoDB connection
const { connectDB } = require('./config/database');

// Import routes
const routes = require('./routes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { createUploadDirs } = require('./config/multer');

// Initialize app
const app = express();

// ===== PORT =====
const PORT = process.env.PORT || 5000;

// ===== TRUST PROXY - FIX FOR RENDER =====
// This fixes the X-Forwarded-For error
app.set('trust proxy', true);

// ===== CORS =====
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// ===== MIDDLEWARE =====
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== RATE LIMITING - FIXED =====
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  skip: (req) => {
    return req.path === '/health';
  },
  // ✅ FIX: Disable X-Forwarded-For validation
  validate: {
    xForwardedForHeader: false,
  },
  // ✅ FIX: Use simple IP detection
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});
app.use('/api', limiter);

// ===== STATIC FILES =====
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== CONNECT DATABASE =====
connectDB();

// ===== CREATE UPLOAD DIRECTORIES =====
createUploadDirs();

// ===== ROUTES =====
app.use('/api', routes);

// ===== WELCOME ROUTE =====
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to The BiggMart API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      hero: '/api/hero',
      testimonials: '/api/testimonials',
      stats: '/api/stats'
    }
  });
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ===== ERROR HANDLING =====
app.use(notFound);
app.use(errorHandler);

// ===== START SERVER =====
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 The BiggMart Server');
  console.log('='.repeat(50));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`📱 API: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
  console.log('📋 Available Endpoints:');
  console.log(`  GET  / - Welcome message`);
  console.log(`  GET  /health - Health check`);
  console.log(`  GET  /api/health - Health check`);
  console.log(`  POST /api/auth/login - Admin login`);
  console.log(`  GET  /api/products - Get all products`);
  console.log(`  POST /api/products - Create product (Admin)`);
  console.log(`  GET  /api/hero - Get hero images`);
  console.log(`  POST /api/hero - Add hero image (Admin)`);
  console.log(`  GET  /api/testimonials - Get testimonials`);
  console.log(`  POST /api/testimonials - Add testimonial (Admin)`);
  console.log(`  GET  /api/stats - Get statistics`);
  console.log('='.repeat(50));
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  console.log('💡 Note: SIGTERM is sent by Render when the server is being stopped or redeployed.');
  server.close(() => {
    console.log('🔌 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  console.log('💡 Note: SIGINT is sent when you press Ctrl+C in the terminal.');
  
  server.close(() => {
    console.log('🔌 Server closed');
    process.exit(0);
  });
});

module.exports = app;
