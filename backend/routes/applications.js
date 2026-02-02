const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

/**
 * Application Routes
 * All routes require authentication
 */

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (Candidate only)
router.post('/', authenticate, roleCheck(['candidate']), applicationController.applyForJob);

// @route   GET /api/applications/my-applications
// @desc    Get candidate's applications
// @access  Private (Candidate only)
router.get('/my-applications', authenticate, roleCheck(['candidate']), applicationController.getMyApplications);

// @route   GET /api/applications/job/:jobId
// @desc    Get applications for a job
// @access  Private (Employer - own jobs, or Admin)
router.get('/job/:jobId', authenticate, roleCheck(['employer', 'admin']), applicationController.getJobApplications);

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private (Candidate - own, Employer - own job, Admin)
router.get('/:id', authenticate, applicationController.getApplicationById);

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Employer only)
router.put('/:id/status', authenticate, roleCheck(['employer', 'admin']), applicationController.updateApplicationStatus);

module.exports = router;
