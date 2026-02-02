const { verifyAccessToken } = require('../config/jwt');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 * 
 * WHY: This middleware protects routes that require authentication.
 * It extracts the JWT from cookies, verifies it, and loads the user data.
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database (excluding password)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid token.',
    });
  }
};

module.exports = authenticate;
