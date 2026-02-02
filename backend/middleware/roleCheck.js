/**
 * Role-Based Access Control Middleware
 * Restricts access to routes based on user roles
 * 
 * WHY: Different features are available to different user types.
 * For example, only employers can post jobs, only admins can approve users.
 * 
 * USAGE: roleCheck(['admin', 'employer']) - allows both admins and employers
 */
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
    }

    // For employers, check if they are approved
    if (req.user.role === 'employer' && !req.user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your employer account is pending approval.',
      });
    }

    next();
  };
};

module.exports = roleCheck;
