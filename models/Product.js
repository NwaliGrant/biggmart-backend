/**
 * PRODUCT MODEL - MongoDB Schema
 * Collection: products
 * Handles product data for the store
 */

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['gadgets', 'electronics', 'home'],
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    default: '',
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  is_sold_out: {
    type: Boolean,
    default: false
  },
  image_url: {
    type: String,
    default: null
  },
  featured: {
    type: Boolean,
    default: false
  },
  display_order: {
    type: Number,
    default: 0
  },
  view_count: {
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

ProductSchema.index({ category: 1 });
ProductSchema.index({ is_sold_out: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ created_at: -1 });

// ======================= STATIC METHODS =======================

/**
 * Get all products
 * @returns {Promise<Array>} Array of products
 */
ProductSchema.statics.getAll = async function() {
  return this.find().sort({ created_at: -1 });
};

/**
 * Get featured products
 * @param {number} limit - Maximum number of products
 * @returns {Promise<Array>} Array of featured products
 */
ProductSchema.statics.getFeatured = async function(limit = 10) {
  return this.find({ is_sold_out: false })
    .sort({ created_at: -1 })
    .limit(limit);
};

/**
 * Get products by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of products
 */
ProductSchema.statics.getByCategory = async function(category) {
  return this.find({ category }).sort({ created_at: -1 });
};

/**
 * Get product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Product document
 */
ProductSchema.statics.getById = async function(id) {
  return this.findById(id);
};

/**
 * Get product stats
 * @returns {Promise<Object>} Product statistics
 */
ProductSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const soldOut = await this.countDocuments({ is_sold_out: true });
  const featured = await this.countDocuments({ featured: true });
  return { total, soldOut, featured };
};

/**
 * Search products
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching products
 */
ProductSchema.statics.search = async function(query) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  });
};

// ======================= INSTANCE METHODS =======================

/**
 * Increment view count
 * @returns {Promise<Object>} Updated product
 */
ProductSchema.methods.incrementViews = async function() {
  this.view_count += 1;
  return this.save();
};

/**
 * Toggle sold out status
 * @returns {Promise<Object>} Updated product
 */
ProductSchema.methods.toggleSoldOut = async function() {
  this.is_sold_out = !this.is_sold_out;
  return this.save();
};

// ======================= MIDDLEWARE =======================

/**
 * Log product creation
 */
ProductSchema.post('save', function(doc) {
  console.log(`📦 Product created: ${doc.name} (${doc._id})`);
});

/**
 * Log product deletion
 */
ProductSchema.post('remove', function(doc) {
  console.log(`🗑️ Product deleted: ${doc.name} (${doc._id})`);
});

/**
 * Return product without version field
 */
ProductSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Product', ProductSchema);
