/**
 * HERO CONTROLLER
 * Handles hero image CRUD operations
 */

const Hero = require('../models/Hero');
const fs = require('fs');
const path = require('path');

/**
 * Get all hero images
 * GET /api/hero
 */
const getHeroImages = async (req, res) => {
  try {
    const { active } = req.query;
    let images;
    
    if (active === 'true') {
      images = await Hero.getActive();
    } else {
      images = await Hero.getAll();
    }
    
    // Add full URL for images
    images = images.map(img => ({
      ...img.toObject(),
      image_url: `${req.protocol}://${req.get('host')}${img.image_url}`
    }));
    
    res.json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    console.error('Get hero images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero images'
    });
  }
};

/**
 * Get single hero image
 * GET /api/hero/:id
 */
const getHeroImage = async (req, res) => {
  try {
    const image = await Hero.getById(req.params.id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Hero image not found'
      });
    }
    
    const imageData = image.toObject();
    imageData.image_url = `${req.protocol}://${req.get('host')}${imageData.image_url}`;
    
    res.json({
      success: true,
      data: imageData
    });
  } catch (error) {
    console.error('Get hero image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero image'
    });
  }
};

/**
 * Create hero image
 * POST /api/hero
 */
const createHeroImage = async (req, res) => {
  try {
    const { title, subtitle, display_order, product_id } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    const image_url = `/uploads/hero/${req.file.filename}`;
    
    const imageData = {
      image_url,
      title: title || '',
      subtitle: subtitle || '',
      display_order: parseInt(display_order) || 0,
      product_id: product_id || null
    };
    
    const image = await Hero.create(imageData);
    
    res.status(201).json({
      success: true,
      message: 'Hero image added successfully',
      data: image
    });
  } catch (error) {
    console.error('Create hero image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add hero image'
    });
  }
};

/**
 * Update hero image
 * PUT /api/hero/:id
 */
const updateHeroImage = async (req, res) => {
  try {
    const image = await Hero.getById(req.params.id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Hero image not found'
      });
    }
    
    const { title, subtitle, display_order, is_active } = req.body;
    
    let image_url = image.image_url;
    
    // Handle image upload
    if (req.file) {
      // Delete old image
      if (image.image_url) {
        const oldPath = path.join(__dirname, '..', image.image_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      image_url = `/uploads/hero/${req.file.filename}`;
    }
    
    const updateData = {
      image_url,
      title: title !== undefined ? title : image.title,
      subtitle: subtitle !== undefined ? subtitle : image.subtitle,
      display_order: display_order !== undefined ? parseInt(display_order) : image.display_order,
      is_active: is_active !== undefined ? is_active === 'true' : image.is_active
    };
    
    const updatedImage = await Hero.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Hero image updated successfully',
      data: updatedImage
    });
  } catch (error) {
    console.error('Update hero image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hero image'
    });
  }
};

/**
 * Delete hero image
 * DELETE /api/hero/:id
 */
const deleteHeroImage = async (req, res) => {
  try {
    const image = await Hero.getById(req.params.id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Hero image not found'
      });
    }
    
    // Delete image file
    if (image.image_url) {
      const imagePath = path.join(__dirname, '..', image.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Hero.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Hero image deleted successfully'
    });
  } catch (error) {
    console.error('Delete hero image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hero image'
    });
  }
};

module.exports = {
  getHeroImages,
  getHeroImage,
  createHeroImage,
  updateHeroImage,
  deleteHeroImage
};
