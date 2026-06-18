/**
 * STATS MODEL - MongoDB Schema
 * Collection: stats
 * Handles website statistics and counters
 */

const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
  total_products: {
    type: Number,
    default: 0,
    min: 0
  },
  total_sold_out: {
    type: Number,
    default: 0,
    min: 0
  },
  total_cities: {
    type: Number,
    default: 50,
    min: 0
  },
  total_customers: {
    type: Number,
    default: 15000,
    min: 0
  },
  total_sales: {
    type: Number,
    default: 0,
    min: 0
  },
  total_revenue: {
    type: Number,
    default: 0,
    min: 0
  },
  on_time_delivery: {
    type: Number,
    default: 98,
    min: 0,
    max: 100
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: 'updated_at'
  }
});

// ======================= STATIC METHODS =======================

/**
 * Get stats (always returns a document)
 * @returns {Promise<Object>} Stats document
 */
StatsSchema.statics.get = async function() {
  let stats = await this.findOne();
  if (!stats) {
    stats = await this.create({
      total_products: 0,
      total_sold_out: 0,
      total_cities: 50,
      total_customers: 15000,
      total_sales: 0,
      total_revenue: 0,
      on_time_delivery: 98
    });
  }
  return stats;
};

/**
 * Update stats with partial data
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated stats
 */
StatsSchema.statics.updateStats = async function(updateData) {
  let stats = await this.findOne();
  
  if (!stats) {
    stats = await this.create({
      total_products: 0,
      total_sold_out: 0,
      total_cities: 50,
      total_customers: 15000,
      total_sales: 0,
      total_revenue: 0,
      on_time_delivery: 98
    });
  }
  
  // Update only fields that are provided
  const allowedFields = [
    'total_products',
    'total_sold_out',
    'total_cities',
    'total_customers',
    'total_sales',
    'total_revenue',
    'on_time_delivery'
  ];
  
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      stats[field] = updateData[field];
    }
  });
  
  return stats.save();
};

/**
 * Sync product counts from Product model
 * @param {Object} ProductModel - Product model
 * @returns {Promise<Object>} Updated stats
 */
StatsSchema.statics.syncProductCounts = async function(ProductModel) {
  const total = await ProductModel.countDocuments();
  const soldOut = await ProductModel.countDocuments({ is_sold_out: true });
  
  const stats = await this.findOne();
  if (stats) {
    stats.total_products = total;
    stats.total_sold_out = soldOut;
    await stats.save();
  } else {
    await this.create({
      total_products: total,
      total_sold_out: soldOut
    });
  }
  
  return { total, soldOut };
};

/**
 * Increment a counter
 * @param {string} field - Field name to increment
 * @param {number} amount - Amount to increment by
 * @returns {Promise<Object>} Updated stats
 */
StatsSchema.statics.increment = async function(field, amount = 1) {
  const stats = await this.findOne();
  if (!stats) {
    return this.create({ [field]: amount });
  }
  
  if (stats[field] !== undefined) {
    stats[field] += amount;
    return stats.save();
  }
  
  return stats;
};

/**
 * Reset all stats
 * @returns {Promise<Object>} Reset stats
 */
StatsSchema.statics.reset = async function() {
  let stats = await this.findOne();
  if (!stats) {
    stats = await this.create({});
  }
  
  stats.total_products = 0;
  stats.total_sold_out = 0;
  stats.total_cities = 0;
  stats.total_customers = 0;
  stats.total_sales = 0;
  stats.total_revenue = 0;
  stats.on_time_delivery = 0;
  
  return stats.save();
};

// ======================= MIDDLEWARE =======================

/**
 * Log stats updates
 */
StatsSchema.post('save', function(doc) {
  console.log(`📊 Stats updated: Products=${doc.total_products}, Customers=${doc.total_customers}`);
});

/**
 * Return stats without version field
 */
StatsSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  delete obj._id;
  return obj;
};

module.exports = mongoose.model('Stats', StatsSchema);
