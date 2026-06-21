/**
 * PRODUCT ROUTES
 * Product management endpoints
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { upload } = require('../../config/cloudinary'); // ✅ Cloudinary
const { validateProduct } = require('../../middleware/validation');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleSoldOut
} = require('../../controllers/productController');

// ======================= PUBLIC ROUTES =======================

/**
 * @route   GET /api/products
 * @desc    Get all products (with filters)
 * @access  Public
 */
router.get('/', getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product
 * @access  Public
 */
router.get('/:id', getProduct);

// ======================= PROTECTED ROUTES (Admin Only) =======================

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (Admin)
 */
router.post(
  '/', 
  protect, 
  upload.single('image'), // ✅ Cloudinary upload
  validateProduct, 
  createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Admin)
 */
router.put(
  '/:id', 
  protect, 
  upload.single('image'), // ✅ Cloudinary upload
  validateProduct, 
  updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private (Admin)
 */
router.delete('/:id', protect, deleteProduct);

/**
 * @route   PATCH /api/products/:id/toggle-soldout
 * @desc    Toggle sold out status
 * @access  Private (Admin)
 */
router.patch('/:id/toggle-soldout', protect, toggleSoldOut);

module.exports = router;
