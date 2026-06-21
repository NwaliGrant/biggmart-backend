/**
 * THE BIGGMART - EXPRESS.JS SERVER
 * ✅ CORS FIXED - Allows all origins
 * ✅ Cloudinary Integration - Permanent image storage
 * ✅ MongoDB connection with retry
 * ✅ Complete API routes
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

// Import Cloudinary upload (no need for createUploadDirs)
const { upload } = require('./config/cloudinary');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// ======================= CORS - FULLY OPEN =======================
app.use(cors({
  origin: '*', // Allow ALL origins (for development)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// ======================= MIDDLEWARE =======================

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Logging
app.use(morgan('dev'));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================= RATE LIMITING =======================
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Allow 1000 requests per minute
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  }
});
app.use('/api', limiter);

// ======================= STATIC FILES =======================
// Note: With Cloudinary, we don't need local uploads folder
// But keep this for any static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================= CONNECT DATABASE =======================
connectDB();

// ======================= ROUTES =======================

// Mount all API routes
app.use('/api', routes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to The BiggMart API',
    version: '1.0.0',
    storage: 'Cloudinary ☁️',
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

// ======================= ERROR HANDLING =======================

// 404 Not Found handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ======================= START SERVER =======================

const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 The BiggMart Server');
  console.log('='.repeat(50));
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`📱 API: http://localhost:${PORT}/api`);
  console.log(`☁️  Images stored in Cloudinary`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
  console.log('📋 Available Endpoints:');
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

// ======================= GRACEFUL SHUTDOWN =======================

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('🔌 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('🔌 Server closed');
    process.exit(0);
  });
});

module.exports = app;
