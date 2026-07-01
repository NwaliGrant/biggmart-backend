/**
 * STATS MODEL - MongoDB Schema
 */

const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
  total_products: {
    type: Number,
    default: 0
  },
  total_sold_out: {
    type: Number,
    default: 0
  },
  total_cities: {
    type: Number,
    default: 50
  },
  total_customers: {
    type: Number,
    default: 15000
  },
  total_sales: {
    type: Number,
    default: 0
  },
  total_revenue: {
    type: Number,
    default: 0
  },
  on_time_delivery: {
    type: Number,
    default: 98
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: 'updated_at'
  }
});

// Static methods
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

StatsSchema.statics.updateStats = async function(updateData) {
  let stats = await this.findOne();
  if (!stats) {
    stats = await this.create(updateData);
  } else {
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        stats[key] = updateData[key];
      }
    });
    await stats.save();
  }
  return stats;
};

module.exports = mongoose.model('Stats', StatsSchema);
