/**
 * GLOBAL ERROR HANDLER
 * Centralized error handling for the application
 */

/**
 * Global error handler middleware
 * @param {Object} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // ======================= MULTER ERRORS =======================
  
  // File too large
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = `File is too large. Maximum size is ${process.env.MAX_FILE_SIZE / 1024 / 1024}MB.`;
  }
  
  // File count exceeded
  if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Too many files uploaded. Maximum is 5 files.';
  }
  
  // File type not allowed
  if (err.message === 'Only image files are allowed') {
    statusCode = 400;
    message = 'Only image files are allowed (JPEG, PNG, JPG, WEBP, GIF).';
  }

  // ======================= MONGOOSE ERRORS =======================
  
  // Duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists. Please use a different ${field}.`;
  }
  
  // Validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(e => e.message);
    message = errors.join(', ');
  }
  
  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  
  // Document not found
  if (err.name === 'DocumentNotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // ======================= JWT ERRORS =======================
  
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please login again.';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please login again.';
  }

  // ======================= RESPONSE =======================
  
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
};

/**
 * Not found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
