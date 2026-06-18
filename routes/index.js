/**
 * ROUTES INDEX
 * Centralizes all route exports
 */

const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./api/auth');
const productRoutes = require('./api/products');
const heroRoutes = require('./api/hero');
const testimonialRoutes = require('./api/testimonials');
const statsRoutes = require('./api/stats');

// ===== HEALTH CHECK ROUTE =====
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ===== MOUNT ALL ROUTES =====
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/hero', heroRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/stats', statsRoutes);

// ===== TEST ROUTE =====
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// ===== 404 HANDLER FOR API =====
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found in API`
  });
});

module.exports = router;
