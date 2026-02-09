const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

/**
 * Admin Controller
 * Handles admin-specific operations: user management, analytics, moderation
 * 
 * WHY: Admins need special tools to manage the platform, approve employers,
 * moderate content, and view system-wide statistics.
 */

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard analytics
 * @access  Private (Admin only)
 */
exports.getDashboard = async (req, res, next) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    const pendingEmployers = await User.countDocuments({ role: 'employer', isApproved: false });
    
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });
    
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const shortlistedApplications = await Application.countDocuments({ status: 'shortlisted' });

    // Recent activities - wrap in try-catch for safety
    let recentJobs = [];
    let recentApplications = [];
    
    try {
      recentJobs = await Job.find()
        .populate('employer', 'name company')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(); // Use lean() for better performance
    } catch (err) {
      console.error('Error fetching recent jobs:', err.message);
      // Continue with empty array
    }

    try {
      recentApplications = await Application.find()
        .populate('candidate', 'name email')
        .populate('job', 'title company')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    } catch (err) {
      console.error('Error fetching recent applications:', err.message);
      // Continue with empty array
    }

    res.json({
      success: true,
      data: {
        stats: {
          users: { total: totalUsers, candidates: totalCandidates, employers: totalEmployers, pendingEmployers },
          jobs: { total: totalJobs, active: activeJobs, closed: closedJobs },
          applications: { total: totalApplications, pending: pendingApplications, shortlisted: shortlistedApplications },
        },
        recentJobs,
        recentApplications,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};
