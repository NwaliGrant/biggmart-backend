/**
 * HERO ROUTES
 * Hero image management endpoints
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { upload } = require('../../config/cloudinary'); // ✅ Cloudinary
const { validateHero } = require('../../middleware/validation');
const {
  getHeroImages,
  getHeroImage,
  createHeroImage,
  updateHeroImage,
  deleteHeroImage
} = require('../../controllers/heroController');

// ======================= PUBLIC ROUTES =======================

/**
 * @route   GET /api/hero
 * @desc    Get all hero images (active filter optional)
 * @access  Public
 */
router.get('/', getHeroImages);

/**
 * @route   GET /api/hero/:id
 * @desc    Get single hero image
 * @access  Public
 */
router.get('/:id', getHeroImage);

// ======================= PROTECTED ROUTES (Admin Only) =======================

/**
 * @route   POST /api/hero
 * @desc    Add hero image
 * @access  Private (Admin)
 */
router.post(
  '/', 
  protect, 
  upload.single('image'), // ✅ Cloudinary upload
  validateHero, 
  createHeroImage
);

/**
 * @route   PUT /api/hero/:id
 * @desc    Update hero image
 * @access  Private (Admin)
 */
router.put(
  '/:id', 
  protect, 
  upload.single('image'), // ✅ Cloudinary upload
  validateHero, 
  updateHeroImage
);

/**
 * @route   DELETE /api/hero/:id
 * @desc    Delete hero image
 * @access  Private (Admin)
 */
router.delete('/:id', protect, deleteHeroImage);

/**
 * @route   PATCH /api/hero/:id/toggle-active
 * @desc    Toggle active status
 * @access  Private (Admin)
 */
router.patch('/:id/toggle-active', protect, async (req, res) => {
  try {
    const Hero = require('../../models/Hero');
    const hero = await Hero.findById(req.params.id);
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero image not found'
      });
    }
    
    hero.is_active = !hero.is_active;
    await hero.save();
    
    res.json({
      success: true,
      message: `Hero image ${hero.is_active ? 'activated' : 'deactivated'}`,
      is_active: hero.is_active
    });
  } catch (error) {
    console.error('Toggle hero active error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle hero status'
    });
  }
});

module.exports = router;
