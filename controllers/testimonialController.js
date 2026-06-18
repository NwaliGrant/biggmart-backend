/**
 * TESTIMONIAL CONTROLLER
 * Handles testimonial CRUD operations
 */

const Testimonial = require('../models/Testimonial');

/**
 * Get all testimonials
 * GET /api/testimonials
 */
const getTestimonials = async (req, res) => {
  try {
    const { published } = req.query;
    let testimonials;
    
    if (published === 'true') {
      testimonials = await Testimonial.getPublished();
    } else {
      testimonials = await Testimonial.getAll();
    }
    
    res.json({
      success: true,
      count: testimonials.length,
      data: testimonials
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials'
    });
  }
};

/**
 * Get single testimonial
 * GET /api/testimonials/:id
 */
const getTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.getById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    
    res.json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonial'
    });
  }
};

/**
 * Create testimonial
 * POST /api/testimonials
 */
const createTestimonial = async (req, res) => {
  try {
    const { customer_name, location, content, rating, is_published } = req.body;
    
    if (!customer_name || !content) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and content are required'
      });
    }
    
    const testimonialData = {
      customer_name,
      location: location || '',
      content,
      rating: parseInt(rating) || 5,
      is_published: is_published !== 'false'
    };
    
    const testimonial = await Testimonial.create(testimonialData);
    
    res.status(201).json({
      success: true,
      message: 'Testimonial added successfully',
      data: testimonial
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add testimonial'
    });
  }
};

/**
 * Update testimonial
 * PUT /api/testimonials/:id
 */
const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.getById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    
    const { customer_name, location, content, rating, is_published } = req.body;
    
    const updateData = {
      customer_name: customer_name || testimonial.customer_name,
      location: location !== undefined ? location : testimonial.location,
      content: content || testimonial.content,
      rating: rating !== undefined ? parseInt(rating) : testimonial.rating,
      is_published: is_published !== undefined ? is_published !== 'false' : testimonial.is_published
    };
    
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      data: updatedTestimonial
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update testimonial'
    });
  }
};

/**
 * Delete testimonial
 * DELETE /api/testimonials/:id
 */
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.getById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    
    await Testimonial.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial'
    });
  }
};

/**
 * Toggle publish status
 * PATCH /api/testimonials/:id/toggle-publish
 */
const togglePublish = async (req, res) => {
  try {
    const testimonial = await Testimonial.getById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    
    const newStatus = !testimonial.is_published;
    testimonial.is_published = newStatus;
    await testimonial.save();
    
    res.json({
      success: true,
      message: `Testimonial ${newStatus ? 'published' : 'unpublished'}`,
      is_published: newStatus
    });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update testimonial status'
    });
  }
};

module.exports = {
  getTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  togglePublish
};
