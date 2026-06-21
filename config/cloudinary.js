/**
 * CLOUDINARY CONFIGURATION
 * Permanent cloud storage for images
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test connection
cloudinary.api.ping()
  .then(() => console.log('✅ Cloudinary connected successfully'))
  .catch((err) => console.error('❌ Cloudinary connection failed:', err.message));

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => {
      // Determine folder based on route
      if (req.baseUrl && req.baseUrl.includes('hero')) {
        return 'biggmart/hero';
      }
      return 'biggmart/products';
    },
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'svg'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

// Create multer instance with Cloudinary storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed. Only images are allowed.`), false);
    }
  }
});

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<boolean>} True if deleted successfully
 */
const deleteImage = async (publicId) => {
  try {
    if (!publicId) return false;
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️ Deleted image: ${publicId}`);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error.message);
    return false;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary image URL
 * @returns {string|null} Public ID or null
 */
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  try {
    // Format: https://res.cloudinary.com/cloud-name/image/upload/v123456/folder/image.jpg
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    const pathParts = parts[1].split('/');
    // Remove version number if present (v123456)
    const versionIndex = pathParts.findIndex(p => p.startsWith('v'));
    const startIndex = versionIndex !== -1 ? versionIndex + 1 : 0;
    const publicId = pathParts.slice(startIndex).join('/').split('.')[0];
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error.message);
    return null;
  }
};

/**
 * Upload an image directly to Cloudinary (for use in controllers)
 * @param {string} base64Image - Base64 encoded image
 * @param {string} folder - Folder name
 * @returns {Promise<object>} Upload result
 */
const uploadImage = async (base64Image, folder = 'biggmart/products') => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error.message);
    throw error;
  }
};

module.exports = {
  upload,
  cloudinary,
  deleteImage,
  getPublicIdFromUrl,
  uploadImage
};
