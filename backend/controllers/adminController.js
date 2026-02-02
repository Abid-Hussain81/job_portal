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

    // Recent activities
    const recentJobs = await Job.find()
      .populate('employer', 'name company')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentApplications = await Application.find()
      .populate('candidate', 'name email')
      .populate('job', 'title company')
      .sort({ createdAt: -1 })
      .limit(5);

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
    next(error);
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters
 * @access  Private (Admin only)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, isApproved, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/users/:id/approve
 * @desc    Approve or reject employer
 * @access  Private (Admin only)
 */
exports.approveEmployer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'employer') {
      return res.status(400).json({
        success: false,
        message: 'Only employers require approval',
      });
    }

    user.isApproved = isApproved;
    await user.save();

    res.json({
      success: true,
      message: `Employer ${isApproved ? 'approved' : 'rejected'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/users/:id/toggle-status
 * @desc    Activate or deactivate user account
 * @access  Private (Admin only)
 */
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user (soft delete by deactivating)
 * @access  Private (Admin only)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Soft delete by deactivating
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/jobs
 * @desc    Get all jobs (including pending/closed)
 * @access  Private (Admin only)
 */
exports.getAllJobsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(filter)
      .populate('employer', 'name company email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/jobs/:id/status
 * @desc    Update job status (moderate)
 * @access  Private (Admin only)
 */
exports.updateJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'closed', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const job = await Job.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    res.json({
      success: true,
      message: 'Job status updated',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};
