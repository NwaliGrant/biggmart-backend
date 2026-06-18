/**
 * VALIDATION MIDDLEWARE
 * Request data validation for API endpoints
 */

/**
 * Validate product data
 */
const validateProduct = (req, res, next) => {
  const { name, category, price } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Product name is required'
    });
  }
  
  if (!category || !['gadgets', 'electronics', 'home'].includes(category)) {
    return res.status(400).json({
      success: false,
      message: 'Valid category is required (gadgets, electronics, home)'
    });
  }
  
  if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid price is required'
    });
  }
  
  next();
};

/**
 * Validate testimonial data
 */
const validateTestimonial = (req, res, next) => {
  const { customer_name, content, rating } = req.body;
  
  if (!customer_name || customer_name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Customer name is required'
    });
  }
  
  if (!content || content.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Testimonial content is required'
    });
  }
  
  if (rating && (isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 5)) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5'
    });
  }
  
  next();
};

/**
 * Validate hero image data
 */
const validateHero = (req, res, next) => {
  if (!req.file && !req.body.image_url) {
    return res.status(400).json({
      success: false,
      message: 'Image is required'
    });
  }
  
  next();
};

/**
 * Validate login data
 */
const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || username.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Username is required'
    });
  }
  
  if (!password || password.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }
  
  next();
};

/**
 * Sanitize input data (remove XSS)
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
const sanitizeInput = (data) => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    return data
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  if (typeof data === 'object') {
    const sanitized = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(data[key]);
      }
    }
    return sanitized;
  }
  
  return data;
};

/**
 * Sanitize request body middleware
 */
const sanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  next();
};

/**
 * Rate limiting middleware (simplified)
 */
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const timestamps = requests.get(ip);
    const validRequests = timestamps.filter(t => now - t < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }
    
    validRequests.push(now);
    requests.set(ip, validRequests);
    
    next();
  };
};

module.exports = {
  validateProduct,
  validateTestimonial,
  validateHero,
  validateLogin,
  sanitizeInput,
  sanitizeBody,
  rateLimit
};
