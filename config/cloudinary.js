/**
 * CLOUDINARY CONFIGURATION
 * SIMPLIFIED: Single image upload only
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => {
      if (req.baseUrl && req.baseUrl.includes('hero')) {
        return 'biggmart/hero';
      }
      return 'biggmart/products';
    },
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

// Create multer instance - SINGLE image only
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper functions
const deleteImage = async (publicId) => {
  try {
    if (!publicId) return false;
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image:', error.message);
    return false;
  }
};

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const pathParts = parts[1].split('/');
    const versionIndex = pathParts.findIndex(p => p.startsWith('v'));
    const startIndex = versionIndex !== -1 ? versionIndex + 1 : 0;
    return pathParts.slice(startIndex).join('/').split('.')[0];
  } catch (error) {
    return null;
  }
};

module.exports = {
  upload,
  cloudinary,
  deleteImage,
  getPublicIdFromUrl
};
