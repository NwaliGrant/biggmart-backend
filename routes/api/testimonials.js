/**
 * TESTIMONIAL ROUTES
 * Testimonial management endpoints
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { validateTestimonial } = require('../../middleware/validation');
const {
  getTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  togglePublish
} = require('../../controllers/testimonialController');

// ======================= PUBLIC ROUTES =======================

/**
 * @route   GET /api/testimonials
 * @desc    Get all testimonials (published filter optional)
 * @access  Public
 */
router.get('/', getTestimonials);

/**
 * @route   GET /api/testimonials/:id
 * @desc    Get single testimonial
 * @access  Public
 */
router.get('/:id', getTestimonial);

// ======================= PROTECTED ROUTES (Admin Only) =======================

/**
 * @route   POST /api/testimonials
 * @desc    Add testimonial
 * @access  Private (Admin)
 */
router.post(
  '/', 
  protect, 
  validateTestimonial, 
  createTestimonial
);

/**
 * @route   PUT /api/testimonials/:id
 * @desc    Update testimonial
 * @access  Private (Admin)
 */
router.put(
  '/:id', 
  protect, 
  validateTestimonial, 
  updateTestimonial
);

/**
 * @route   DELETE /api/testimonials/:id
 * @desc    Delete testimonial
 * @access  Private (Admin)
 */
router.delete('/:id', protect, deleteTestimonial);

/**
 * @route   PATCH /api/testimonials/:id/toggle-publish
 * @desc    Toggle publish status
 * @access  Private (Admin)
 */
router.patch('/:id/toggle-publish', protect, togglePublish);

module.exports = router;
