const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Handles all user types: Candidate, Employer, Admin
 * Uses role-based discrimination pattern
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['candidate', 'employer', 'admin'],
      default: 'candidate',
      required: true,
    },
    // For employers - admin approval required
    isApproved: {
      type: Boolean,
      default: function() {
        // Auto-approve candidates and admins, require approval for employers
        return this.role !== 'employer';
      },
    },
    // Company name for employers
    company: {
      type: String,
      required: function() {
        return this.role === 'employer';
      },
    },
    // Contact information
    phone: {
      type: String,
      trim: true,
    },
    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * Virtual field for user status
 * Combines isActive and isApproved into a single status field for frontend
 */
userSchema.virtual('status').get(function() {
  if (!this.isApproved && this.role === 'employer') {
    return 'pending';
  }
  if (!this.isActive) {
    return 'inactive';
  }
  return 'active';
});

/**
 * Pre-save middleware to hash password
 * Only hash if password is modified
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare password for login
 * @param {String} candidatePassword - Password to check
 * @returns {Boolean} - True if password matches
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Method to get public user data (without sensitive info)
 * @returns {Object} - Safe user object
 */
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
