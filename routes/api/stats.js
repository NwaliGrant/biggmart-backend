/**
 * STATS ROUTES
 * Statistics endpoints
 */

const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../../middleware/auth');
const {
  getStats,
  updateStats,
  syncStats,
  resetStats
} = require('../../controllers/statsController');

// ======================= PUBLIC ROUTES =======================

/**
 * @route   GET /api/stats
 * @desc    Get website statistics
 * @access  Public
 */
router.get('/', getStats);

// ======================= PROTECTED ROUTES (Admin Only) =======================

/**
 * @route   PUT /api/stats
 * @desc    Update statistics
 * @access  Private (Admin)
 */
router.put('/', protect, isAdmin, updateStats);

/**
 * @route   POST /api/stats/sync
 * @desc    Sync product counts
 * @access  Private (Admin)
 */
router.post('/sync', protect, isAdmin, syncStats);

/**
 * @route   POST /api/stats/reset
 * @desc    Reset all statistics
 * @access  Private (Admin)
 */
router.post('/reset', protect, isAdmin, resetStats);

module.exports = router;
