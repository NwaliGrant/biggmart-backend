/**
 * UPLOAD MIDDLEWARE
 * File upload configuration and validation
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads';
    
    if (req.baseUrl && req.baseUrl.includes('hero')) {
      folder = 'uploads/hero';
    } else if (req.baseUrl && req.baseUrl.includes('products')) {
      folder = 'uploads/products';
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

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

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: fileFilter
});

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

const deleteFile = (filePath) => {
  if (!filePath) return false;
  
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

const getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  return `${req.protocol}://${req.get('host')}${filePath}`;
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  createUploadDirs,
  deleteFile,
  getFileUrl
};
