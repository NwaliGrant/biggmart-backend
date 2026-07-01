/**
 * PRODUCT MODEL - MongoDB Schema
 */

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  category: {
    type: String,
    enum: ['gadgets', 'electronics', 'home', 'used'], // ✅ Added 'used'
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
ProductSchema.index({ display_order: 1 });
ProductSchema.index({ created_at: -1 });

// ======================= STATIC METHODS =======================

ProductSchema.statics.getAll = async function(options = {}) {
  const { 
    page = 1, 
    limit = 50, 
    category = null, 
    featured = null,
    sold_out = null
  } = options;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const filter = {};
  if (category && category !== 'all') filter.category = category;
  if (featured !== null) filter.featured = featured === 'true';
  if (sold_out !== null) filter.is_sold_out = sold_out === 'true';
  
  const [data, total] = await Promise.all([
    this.find(filter)
      .sort({ display_order: 1, created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    this.countDocuments(filter)
  ]);
  
  return {
    data,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / parseInt(limit))
  };
};

ProductSchema.statics.getById = async function(id) {
  return this.findById(id);
};

ProductSchema.statics.getStats = async function() {
  const [total, soldOut, featured] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ is_sold_out: true }),
    this.countDocuments({ featured: true })
  ]);
  
  const categories = await this.distinct('category');
  const categoryCounts = {};
  for (const cat of categories) {
    categoryCounts[cat] = await this.countDocuments({ category: cat });
  }
  
  return { total, soldOut, featured, categories: categoryCounts };
};

// ======================= INSTANCE METHODS =======================

ProductSchema.methods.incrementViews = async function() {
  this.view_count = (this.view_count || 0) + 1;
  return this.save();
};

ProductSchema.methods.toggleSoldOut = async function() {
  this.is_sold_out = !this.is_sold_out;
  return this.save();
};

ProductSchema.methods.toggleFeatured = async function() {
  this.featured = !this.featured;
  return this.save();
};

// ======================= MIDDLEWARE =======================

ProductSchema.post('save', function(doc) {
  console.log(`📦 Product saved: ${doc.name} (${doc._id})`);
});

ProductSchema.post('remove', function(doc) {
  console.log(`🗑️ Product deleted: ${doc.name} (${doc._id})`);
});

ProductSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Product', ProductSchema);
