/**
 * LOGGER MIDDLEWARE
 * Request logging for debugging and monitoring
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = './logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Create a log entry
 * @param {string} level - Log level (info, warn, error)
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
const createLog = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data
  };
  
  // Log to console
  const coloredLevel = {
    info: '\x1b[36m%s\x1b[0m', // Cyan
    warn: '\x1b[33m%s\x1b[0m', // Yellow
    error: '\x1b[31m%s\x1b[0m' // Red
  }[level] || '%s';
  
  console.log(coloredLevel, `[${timestamp}] ${level.toUpperCase()}: ${message}`);
  
  // Log to file
  const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
  const logString = JSON.stringify(logEntry) + '\n';
  fs.appendFileSync(logFile, logString);
};

/**
 * Request logger middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  createLog('info', `${req.method} ${req.originalUrl}`, {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    body: req.method !== 'GET' ? req.body : undefined
  });
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'error' : 'info';
    
    createLog(level, `${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress
    });
  });
  
  next();
};

/**
 * Error logger
 */
const errorLogger = (err, req, res, next) => {
  createLog('error', err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body
  });
  
  next(err);
};

/**
 * API performance logger
 */
const performanceLogger = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const time = diff[0] * 1e3 + diff[1] * 1e-6;
    
    if (time > 1000) {
      createLog('warn', `Slow API call: ${req.method} ${req.originalUrl} - ${time.toFixed(2)}ms`);
    }
  });
  
  next();
};

module.exports = {
  createLog,
  requestLogger,
  errorLogger,
  performanceLogger
};
