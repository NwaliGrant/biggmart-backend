/**
 * STATS CONTROLLER
 * Handles statistics operations
 */

const Stats = require('../models/Stats');
const Product = require('../models/Product');

/**
 * Get stats
 * GET /api/stats
 */
const getStats = async (req, res) => {
  try {
    const stats = await Stats.get();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
};

/**
 * Update stats
 * PUT /api/stats
 */
const updateStats = async (req, res) => {
  try {
    const { 
      total_products, 
      total_sold_out, 
      total_cities, 
      total_customers, 
      total_sales, 
      total_revenue, 
      on_time_delivery 
    } = req.body;
    
    const updateData = {};
    if (total_products !== undefined) updateData.total_products = total_products;
    if (total_sold_out !== undefined) updateData.total_sold_out = total_sold_out;
    if (total_cities !== undefined) updateData.total_cities = total_cities;
    if (total_customers !== undefined) updateData.total_customers = total_customers;
    if (total_sales !== undefined) updateData.total_sales = total_sales;
    if (total_revenue !== undefined) updateData.total_revenue = total_revenue;
    if (on_time_delivery !== undefined) updateData.on_time_delivery = on_time_delivery;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    const updatedStats = await Stats.updateStats(updateData);
    
    res.json({
      success: true,
      message: 'Stats updated successfully',
      data: updatedStats
    });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stats'
    });
  }
};

/**
 * Sync product counts from products collection
 * POST /api/stats/sync
 */
const syncStats = async (req, res) => {
  try {
    await Stats.syncProductCounts(Product);
    
    const stats = await Stats.get();
    
    res.json({
      success: true,
      message: 'Stats synced successfully',
      data: stats
    });
  } catch (error) {
    console.error('Sync stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync stats'
    });
  }
};

/**
 * Reset stats (admin only)
 * POST /api/stats/reset
 */
const resetStats = async (req, res) => {
  try {
    await Stats.updateStats({
      total_products: 0,
      total_sold_out: 0,
      total_cities: 0,
      total_customers: 0,
      total_sales: 0,
      total_revenue: 0,
      on_time_delivery: 0
    });
    
    await Stats.syncProductCounts(Product);
    
    const stats = await Stats.get();
    
    res.json({
      success: true,
      message: 'Stats reset successfully',
      data: stats
    });
  } catch (error) {
    console.error('Reset stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset stats'
    });
  }
};

module.exports = {
  getStats,
  updateStats,
  syncStats,
  resetStats
};
