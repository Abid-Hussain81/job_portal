const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

/**
 * Job Routes
 * Public routes for viewing jobs
 * Protected routes for creating/updating/deleting jobs
 */

// @route   GET /api/jobs
// @desc    Get all jobs with filters
// @access  Public
router.get('/', jobController.getAllJobs);

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', jobController.getJobById);

// @route   POST /api/jobs
// @desc    Create new job
// @access  Private (Employer only)
router.post('/', authenticate, roleCheck(['employer']), jobController.createJob);

// @route   GET /api/jobs/employer/my-jobs
// @desc    Get jobs posted by current employer
// @access  Private (Employer only)
router.get('/employer/my-jobs', authenticate, roleCheck(['employer']), jobController.getMyJobs);

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private (Employer - own jobs only)
router.put('/:id', authenticate, roleCheck(['employer', 'admin']), jobController.updateJob);

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private (Employer - own jobs only, or Admin)
router.delete('/:id', authenticate, roleCheck(['employer', 'admin']), jobController.deleteJob);

module.exports = router;
