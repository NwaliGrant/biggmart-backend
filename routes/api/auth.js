/**
 * AUTH ROUTES
 * Authentication endpoints
 */

const express = require('express');
const router = express.Router();
const { 
  login, 
  getCurrentUser, 
  verifyToken 
} = require('../../controllers/authController');
const { protect } = require('../../middleware/auth');
const { validateLogin } = require('../../middleware/validation');

// ======================= PUBLIC ROUTES =======================

/**
 * @route   POST /api/auth/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/login', validateLogin, login);

// ======================= PROTECTED ROUTES =======================

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, getCurrentUser);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
router.get('/verify', protect, verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (client-side token removal)
 * @access  Private
 */
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
