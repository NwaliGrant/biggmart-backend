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

// ======================= API ROUTES =======================

/**
 * Health check endpoint
 * @route   GET /api/health
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * API version endpoint
 * @route   GET /api/version
 * @access  Public
 */
router.get('/version', (req, res) => {
  res.json({
    success: true,
    version: '1.0.0',
    name: 'The BiggMart API'
  });
});

// ======================= MOUNT ROUTES =======================

// Mount all API routes under /api
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/hero', heroRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
