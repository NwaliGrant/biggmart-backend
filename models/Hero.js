/**
 * HERO MODEL - MongoDB Schema
 * Collection: heroes
 * Handles hero images for the homepage slider
 */

const mongoose = require('mongoose');

const HeroSchema = new mongoose.Schema({
  image_url: {
    type: String,
    required: [true, 'Image URL is required']
  },
  title: {
    type: String,
    default: '',
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  subtitle: {
    type: String,
    default: '',
    maxlength: [200, 'Subtitle cannot exceed 200 characters']
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  display_order: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  click_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// ======================= INDEXES =======================

HeroSchema.index({ display_order: 1 });
HeroSchema.index({ is_active: 1 });

// ======================= STATIC METHODS =======================

/**
 * Get all hero images
 * @returns {Promise<Array>} Array of hero images
 */
HeroSchema.statics.getAll = async function() {
  return this.find().sort({ display_order: 1, created_at: -1 });
};

/**
 * Get active hero images
 * @returns {Promise<Array>} Array of active hero images
 */
HeroSchema.statics.getActive = async function() {
  return this.find({ is_active: true }).sort({ display_order: 1, created_at: -1 });
};

/**
 * Get hero image by ID
 * @param {string} id - Hero image ID
 * @returns {Promise<Object>} Hero image document
 */
HeroSchema.statics.getById = async function(id) {
  return this.findById(id);
};

/**
 * Get first active hero image
 * @returns {Promise<Object>} Hero image document
 */
HeroSchema.statics.getFirst = async function() {
  return this.findOne({ is_active: true }).sort({ display_order: 1 });
};

/**
 * Get hero images by product
 * @param {string} productId - Product ID
 * @returns {Promise<Array>} Array of hero images
 */
HeroSchema.statics.getByProduct = async function(productId) {
  return this.find({ product_id: productId, is_active: true }).sort({ display_order: 1 });
};

// ======================= INSTANCE METHODS =======================

/**
 * Increment click count
 * @returns {Promise<Object>} Updated hero image
 */
HeroSchema.methods.incrementClicks = async function() {
  this.click_count += 1;
  return this.save();
};

/**
 * Toggle active status
 * @returns {Promise<Object>} Updated hero image
 */
HeroSchema.methods.toggleActive = async function() {
  this.is_active = !this.is_active;
  return this.save();
};

// ======================= MIDDLEWARE =======================

/**
 * Log hero image creation
 */
HeroSchema.post('save', function(doc) {
  console.log(`🖼️ Hero image saved: ${doc.title || 'Untitled'} (${doc._id})`);
});

/**
 * Log hero image deletion
 */
HeroSchema.post('remove', function(doc) {
  console.log(`🗑️ Hero image deleted: ${doc.title || 'Untitled'} (${doc._id})`);
});

/**
 * Return hero without version field
 */
HeroSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Hero', HeroSchema);
