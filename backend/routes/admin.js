const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

/**
 * Admin Routes
 * All routes require admin authentication
 */

// @route   GET /api/admin/dashboard
// @desc    Get dashboard analytics
// @access  Private (Admin only)
router.get('/dashboard', authenticate, roleCheck(['admin']), adminController.getDashboard);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', authenticate, roleCheck(['admin']), adminController.getAllUsers);

// @route   PUT /api/admin/users/:id/approve
// @desc    Approve/reject employer
// @access  Private (Admin only)
router.put('/users/:id/approve', authenticate, roleCheck(['admin']), adminController.approveEmployer);

// @route   PUT /api/admin/users/:id/toggle-status
// @desc    Activate/deactivate user
// @access  Private (Admin only)
router.put('/users/:id/toggle-status', authenticate, roleCheck(['admin']), adminController.toggleUserStatus);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', authenticate, roleCheck(['admin']), adminController.deleteUser);

// @route   GET /api/admin/jobs
// @desc    Get all jobs (including pending)
// @access  Private (Admin only)
router.get('/jobs', authenticate, roleCheck(['admin']), adminController.getAllJobsAdmin);

// @route   PUT /api/admin/jobs/:id/status
// @desc    Update job status
// @access  Private (Admin only)
router.put('/jobs/:id/status', authenticate, roleCheck(['admin']), adminController.updateJobStatus);

module.exports = router;
