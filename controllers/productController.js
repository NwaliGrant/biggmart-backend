/**
 * PRODUCT CONTROLLER - SIMPLIFIED
 * Single image only, no carousel
 */

const Product = require('../models/Product');
const Stats = require('../models/Stats');
const mongoose = require('mongoose');
const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');

// ===== HELPER: Clean Product ID =====
function cleanProductId(id) {
    if (!id) return null;
    if (typeof id === 'string' && id.includes(':')) {
        id = id.split(':')[0];
    }
    return id;
}

// ===== GET ALL PRODUCTS =====
const getProducts = async (req, res) => {
  try {
    const { limit = 100, page = 1, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    
    const products = await Product.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// ===== GET SINGLE PRODUCT =====
const getProduct = async (req, res) => {
  try {
    let { id } = req.params;
    id = cleanProductId(id);
    
    console.log(`🔍 Fetching product: ${id}`);
    
    if (!id || id === 'undefined' || id === 'null' || id === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID provided'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    product.view_count = (product.view_count || 0) + 1;
    await product.save();
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Get product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// ===== CREATE PRODUCT =====
const createProduct = async (req, res) => {
  try {
    console.log('📦 Creating product');
    const { name, category, price, description, is_sold_out, featured, display_order } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }
    
    if (!category || !['gadgets', 'electronics', 'home', 'used'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Valid category is required (gadgets, electronics, home, used)'
      });
    }
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }
    
    let image_url = null;
    
    // Handle single image from Cloudinary
    if (req.file) {
      image_url = req.file.path;
      console.log(`📸 Uploaded image: ${image_url}`);
    }
    
    const productData = {
      name: name.trim(),
      category,
      price: parseFloat(price),
      description: description || '',
      is_sold_out: is_sold_out === 'true',
      featured: featured === 'true',
      display_order: parseInt(display_order) || 0,
      image_url
    };
    
    const product = new Product(productData);
    await product.save();
    await updateStats();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
};

// ===== UPDATE PRODUCT =====
const updateProduct = async (req, res) => {
  try {
    let { id } = req.params;
    id = cleanProductId(id);
    
    console.log(`🔄 Updating product: ${id}`);
    
    if (!id || id === 'undefined' || id === 'null' || id === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID provided'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const { name, category, price, description, is_sold_out, featured, display_order } = req.body;
    
    const updateData = {};
    if (name !== undefined && name !== '') updateData.name = name.trim();
    if (category !== undefined && category !== '') updateData.category = category;
    if (price !== undefined && price !== '') updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description;
    if (is_sold_out !== undefined) updateData.is_sold_out = is_sold_out === 'true';
    if (featured !== undefined) updateData.featured = featured === 'true';
    if (display_order !== undefined) updateData.display_order = parseInt(display_order) || 0;
    
    // Handle single image update
    if (req.file) {
      // Delete old image from Cloudinary
      if (product.image_url) {
        const publicId = getPublicIdFromUrl(product.image_url);
        if (publicId) {
          await deleteImage(publicId);
          console.log(`🗑️ Deleted old image: ${publicId}`);
        }
      }
      updateData.image_url = req.file.path;
      console.log(`📸 Updated image: ${req.file.path}`);
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    await updateStats();
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('❌ Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

// ===== DELETE PRODUCT =====
const deleteProduct = async (req, res) => {
  try {
    let { id } = req.params;
    id = cleanProductId(id);
    
    if (!id || id === 'undefined' || id === 'null' || id === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID provided'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Delete image from Cloudinary
    if (product.image_url) {
      const publicId = getPublicIdFromUrl(product.image_url);
      if (publicId) {
        await deleteImage(publicId);
        console.log(`🗑️ Deleted image: ${publicId}`);
      }
    }
    
    await Product.findByIdAndDelete(id);
    await updateStats();
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

// ===== TOGGLE SOLD OUT =====
const toggleSoldOut = async (req, res) => {
  try {
    let { id } = req.params;
    id = cleanProductId(id);
    
    if (!id || id === 'undefined' || id === 'null' || id === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID provided'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    product.is_sold_out = !product.is_sold_out;
    await product.save();
    await updateStats();
    
    res.json({
      success: true,
      message: `Product ${product.is_sold_out ? 'marked as sold out' : 'marked as in stock'}`,
      is_sold_out: product.is_sold_out
    });
  } catch (error) {
    console.error('Toggle sold out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product status'
    });
  }
};

// ===== GET PRODUCT STATS =====
const getProductStats = async (req, res) => {
  try {
    const total = await Product.countDocuments();
    const soldOut = await Product.countDocuments({ is_sold_out: true });
    const featured = await Product.countDocuments({ featured: true });
    const categories = await Product.distinct('category');
    
    const categoryCounts = {};
    for (const cat of categories) {
      categoryCounts[cat] = await Product.countDocuments({ category: cat });
    }
    
    res.json({
      success: true,
      data: {
        total,
        soldOut,
        featured,
        categories: categoryCounts
      }
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product stats'
    });
  }
};

// ===== UPDATE STATS =====
async function updateStats() {
  try {
    const total = await Product.countDocuments();
    const soldOut = await Product.countDocuments({ is_sold_out: true });
    
    let stats = await Stats.findOne();
    if (!stats) {
      stats = new Stats({});
    }
    stats.total_products = total;
    stats.total_sold_out = soldOut;
    await stats.save();
    console.log(`📊 Stats updated: Products=${total}, Sold Out=${soldOut}`);
  } catch (error) {
    console.error('Stats update error:', error);
  }
}

module.exports = {
  getProducts,
  getProduct,
  getProductStats,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleSoldOut
};
