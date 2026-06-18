/**
 * UPLOAD MIDDLEWARE
 * File upload configuration and validation
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Create upload directories if they don't exist
 */
const createUploadDirs = () => {
  const dirs = [
    './uploads',
    './uploads/products',
    './uploads/hero'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

/**
 * Configure storage for uploaded files
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine which folder to save to based on the route
    let folder = 'uploads';
    
    if (req.baseUrl && req.baseUrl.includes('hero')) {
      folder = 'uploads/hero';
    } else if (req.baseUrl && req.baseUrl.includes('products')) {
      folder = 'uploads/products';
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

/**
 * File filter - only allow image files
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Only images are allowed.`), false);
  }
};

/**
 * Create multer instance with configuration
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 1 // Maximum 1 file per upload
  },
  fileFilter: fileFilter
});

/**
 * Middleware for single file upload
 * @param {string} fieldName - The field name for the file (e.g., 'image')
 */
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

/**
 * Middleware for multiple file upload
 * @param {string} fieldName - The field name for the files
 * @param {number} maxCount - Maximum number of files
 */
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

/**
 * Middleware for fields upload (different fields)
 * @param {Array} fields - Array of field configurations
 */
const uploadFields = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

/**
 * Helper to delete a file
 * @param {string} filePath - Path to the file to delete
 */
const deleteFile = (filePath) => {
  if (!filePath) return false;
  
  // Convert URL path to file system path
  const fsPath = filePath.startsWith('/') ? `.${filePath}` : filePath;
  
  try {
    if (fs.existsSync(fsPath)) {
      fs.unlinkSync(fsPath);
      console.log(`🗑️ Deleted file: ${fsPath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting file ${fsPath}:`, error.message);
    return false;
  }
};

/**
 * Helper to get file URL
 * @param {Object} req - Express request object
 * @param {string} filePath - File path
 * @returns {string} Full URL
 */
const getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  return `${req.protocol}://${req.get('host')}${filePath}`;
};

/**
 * Helper to validate image dimensions (optional)
 * @param {string} filePath - Path to the image file
 * @param {Object} options - Options for validation
 * @returns {Promise} Resolves with dimensions or rejects
 */
const validateImageDimensions = (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    // This would require an image processing library like sharp
    // For now, just resolve
    resolve({ width: 0, height: 0 });
  });
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  createUploadDirs,
  deleteFile,
  getFileUrl,
  validateImageDimensions
};
