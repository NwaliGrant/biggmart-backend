/**
 * THE BIGGMART - COMPLETE EXPRESS.JS SERVER
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Import MongoDB connection
const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/api/auth');
const productRoutes = require('./routes/api/products');
const heroRoutes = require('./routes/api/hero');
const testimonialRoutes = require('./routes/api/testimonials');
const statsRoutes = require('./routes/api/stats');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// ======================= TRUST PROXY =======================
app.set('trust proxy', true);

// ======================= CORS =======================
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// ======================= MIDDLEWARE =======================

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression
app.use(compression());

// Logging
app.use(morgan('dev'));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================= RATE LIMITING =======================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/health';
  },
  validate: { trustProxy: false }
});
app.use('/api', limiter);

// ======================= STATIC FILES =======================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================= CONNECT DATABASE =======================
connectDB();

// ======================= ROUTES =======================

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/stats', statsRoutes);

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
  console.log(`  GET  /api/products/:id - Get single product`);
  console.log(`  POST /api/products - Create product (Admin)`);
  console.log(`  PUT  /api/products/:id - Update product (Admin)`);
  console.log(`  DELETE /api/products/:id - Delete product (Admin)`);
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
