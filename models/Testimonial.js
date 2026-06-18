/**
 * TESTIMONIAL MODEL - MongoDB Schema
 * Collection: testimonials
 * Handles customer reviews and testimonials
 */

const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  customer_name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  location: {
    type: String,
    default: '',
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Testimonial content is required'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: 5
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  is_published: {
    type: Boolean,
    default: true
  },
  display_order: {
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

TestimonialSchema.index({ is_published: 1 });
TestimonialSchema.index({ rating: -1 });
TestimonialSchema.index({ created_at: -1 });

// ======================= STATIC METHODS =======================

/**
 * Get all testimonials
 * @returns {Promise<Array>} Array of testimonials
 */
TestimonialSchema.statics.getAll = async function() {
  return this.find().sort({ created_at: -1 });
};

/**
 * Get published testimonials
 * @returns {Promise<Array>} Array of published testimonials
 */
TestimonialSchema.statics.getPublished = async function() {
  return this.find({ is_published: true }).sort({ created_at: -1 });
};

/**
 * Get testimonial by ID
 * @param {string} id - Testimonial ID
 * @returns {Promise<Object>} Testimonial document
 */
TestimonialSchema.statics.getById = async function(id) {
  return this.findById(id);
};

/**
 * Get testimonials by rating
 * @param {number} rating - Minimum rating
 * @returns {Promise<Array>} Array of testimonials
 */
TestimonialSchema.statics.getByRating = async function(rating = 4) {
  return this.find({ rating: { $gte: rating }, is_published: true }).sort({ rating: -1, created_at: -1 });
};

/**
 * Get testimonials by product
 * @param {string} productId - Product ID
 * @returns {Promise<Array>} Array of testimonials
 */
TestimonialSchema.statics.getByProduct = async function(productId) {
  return this.find({ product_id: productId, is_published: true }).sort({ created_at: -1 });
};

/**
 * Get average rating
 * @returns {Promise<number>} Average rating
 */
TestimonialSchema.statics.getAverageRating = async function() {
  const result = await this.aggregate([
    { $match: { is_published: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);
  return result.length > 0 ? Math.round(result[0].avgRating * 10) / 10 : 0;
};

/**
 * Get testimonial stats
 * @returns {Promise<Object>} Testimonial statistics
 */
TestimonialSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const published = await this.countDocuments({ is_published: true });
  const avgRating = await this.getAverageRating();
  return { total, published, avgRating };
};

// ======================= INSTANCE METHODS =======================

/**
 * Toggle publish status
 * @returns {Promise<Object>} Updated testimonial
 */
TestimonialSchema.methods.togglePublish = async function() {
  this.is_published = !this.is_published;
  return this.save();
};

// ======================= MIDDLEWARE =======================

/**
 * Log testimonial creation
 */
TestimonialSchema.post('save', function(doc) {
  console.log(`⭐ Testimonial saved: ${doc.customer_name} (${doc._id})`);
});

/**
 * Log testimonial deletion
 */
TestimonialSchema.post('remove', function(doc) {
  console.log(`🗑️ Testimonial deleted: ${doc.customer_name} (${doc._id})`);
});

/**
 * Return testimonial without version field
 */
TestimonialSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Testimonial', TestimonialSchema);
