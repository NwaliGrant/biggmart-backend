/**
 * PRODUCT CONTROLLER
 * Handles product CRUD operations with Cloudinary
 */

const Product = require('../models/Product');
const Stats = require('../models/Stats');
const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');

/**
 * Get all products
 * GET /api/products
 */
const getProducts = async (req, res) => {
  try {
    const { category, featured, limit } = req.query;
    let products;
    
    if (category && category !== 'all') {
      products = await Product.getByCategory(category);
    } else if (featured === 'true') {
      products = await Product.getFeatured(parseInt(limit) || 10);
    } else {
      products = await Product.getAll();
    }
    
    // Products already have full Cloudinary URLs
    res.json({
      success: true,
      count: products.length,
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

/**
 * Get single product
 * GET /api/products/:id
 */
const getProduct = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

/**
 * Create product
 * POST /api/products
 */
const createProduct = async (req, res) => {
  try {
    const { name, category, price, description, is_sold_out } = req.body;
    
    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and price are required'
      });
    }
    
    // ✅ Get image URL from Cloudinary
    let image_url = null;
    if (req.file) {
      image_url = req.file.path; // Cloudinary returns the full URL
    }
    
    const productData = {
      name,
      category,
      price: parseFloat(price),
      description: description || '',
      is_sold_out: is_sold_out === 'true',
      image_url
    };
    
    const product = await Product.create(productData);
    
    // Update stats
    await Stats.syncProductCounts(Product);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
};

/**
 * Update product
 * PUT /api/products/:id
 */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const { name, category, price, description, is_sold_out } = req.body;
    
    let image_url = product.image_url;
    
    // ✅ Handle Cloudinary image upload
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (product.image_url) {
        const publicId = getPublicIdFromUrl(product.image_url);
        if (publicId) {
          await deleteImage(publicId);
        }
      }
      image_url = req.file.path; // New Cloudinary URL
    }
    
    const updateData = {
      name: name || product.name,
      category: category || product.category,
      price: price ? parseFloat(price) : product.price,
      description: description !== undefined ? description : product.description,
      is_sold_out: is_sold_out !== undefined ? is_sold_out === 'true' : product.is_sold_out,
      image_url
    };
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Update stats
    await Stats.syncProductCounts(Product);
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

/**
 * Delete product
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // ✅ Delete image from Cloudinary if exists
    if (product.image_url) {
      const publicId = getPublicIdFromUrl(product.image_url);
      if (publicId) {
        await deleteImage(publicId);
      }
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    // Update stats
    await Stats.syncProductCounts(Product);
    
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

/**
 * Toggle sold out status
 * PATCH /api/products/:id/toggle-soldout
 */
const toggleSoldOut = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const newStatus = !product.is_sold_out;
    product.is_sold_out = newStatus;
    await product.save();
    
    // Update stats
    await Stats.syncProductCounts(Product);
    
    res.json({
      success: true,
      message: `Product ${newStatus ? 'marked as sold out' : 'marked as in stock'}`,
      is_sold_out: newStatus
    });
  } catch (error) {
    console.error('Toggle sold out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product status'
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleSoldOut
};
