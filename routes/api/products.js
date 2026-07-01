/**
 * PRODUCT ROUTES - SIMPLIFIED
 * Single image only, no carousel
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { upload } = require('../../config/cloudinary');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleSoldOut,
  getProductStats
} = require('../../controllers/productController');

// ===== PUBLIC ROUTES =====
router.get('/', getProducts);
router.get('/stats', getProductStats);
router.get('/:id', getProduct);

// ===== PROTECTED ROUTES =====
router.post('/', protect, upload.single('image'), createProduct);
router.put('/:id', protect, upload.single('image'), updateProduct);
router.delete('/:id', protect, deleteProduct);
router.patch('/:id/toggle-soldout', protect, toggleSoldOut);

module.exports = router;
