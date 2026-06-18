/**
 * ADMIN MODEL - MongoDB Schema
 * Collection: admins
 * Handles admin users for the dashboard
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters']
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required']
  },
  full_name: {
    type: String,
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  role: {
    type: String,
    enum: ['admin', 'manager'],
    default: 'admin'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// ======================= STATIC METHODS =======================

/**
 * Find admin by username
 * @param {string} username - Admin username
 * @returns {Promise<Object>} Admin document
 */
AdminSchema.statics.findByUsername = async function(username) {
  return this.findOne({ username });
};

/**
 * Find admin by ID
 * @param {string} id - Admin ID
 * @returns {Promise<Object>} Admin document
 */
AdminSchema.statics.findById = async function(id) {
  return this.findById(id);
};

/**
 * Verify password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
AdminSchema.statics.verifyPassword = async function(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
};

// ======================= INSTANCE METHODS =======================

/**
 * Compare password
 * @param {string} candidatePassword - Password to check
 * @returns {Promise<boolean>} True if password matches
 */
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// ======================= MIDDLEWARE =======================

/**
 * Hash password before saving
 */
AdminSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password_hash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Return user without sensitive data
 */
AdminSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password_hash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Admin', AdminSchema);
