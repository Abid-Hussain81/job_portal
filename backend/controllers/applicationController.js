const Application = require('../models/Application');
const Job = require('../models/Job');
const { body, validationResult } = require('express-validator');

/**
 * Application Controller
 * Manages job applications from candidates
 * 
 * WHY: Applications connect candidates to jobs. This controller handles
 * the entire application lifecycle from submission to status updates.
 */

/**
 * @route   POST /api/applications
 * @desc    Apply for a job
 * @access  Private (Candidate only)
 */
exports.applyForJob = [
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('coverLetter').trim().notEmpty().withMessage('Cover letter is required'),
  body('resumeURL').trim().notEmpty().withMessage('Resume URL is required'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { jobId, coverLetter, resumeURL, expectedSalary, availableFrom } = req.body;

      // Check if job exists and is active
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found',
        });
      }

      if (job.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'This job is no longer accepting applications',
        });
      }

      // Check if already applied
      const existingApplication = await Application.findOne({
        job: jobId,
        candidate: req.user._id,
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied for this job',
        });
      }

      // Create application
      const application = await Application.create({
        job: jobId,
        candidate: req.user._id,
        coverLetter,
        resumeURL,
        expectedSalary,
        availableFrom,
      });

      // Increment application count on job
      await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * @route   GET /api/applications/my-applications
 * @desc    Get all applications by current candidate
 * @access  Private (Candidate only)
 */
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'title company location jobType status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/applications/job/:jobId
 * @desc    Get all applications for a specific job
 * @access  Private (Employer - own jobs only, or Admin)
 */
exports.getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check authorization (employer must own the job, or be admin)
    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these applications',
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate('candidate', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/applications/:id/status
 * @desc    Update application status (shortlist/reject/accept)
 * @access  Private (Employer only)
 */
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, employerNotes } = req.body;

    // Validate status
    if (!['pending', 'shortlisted', 'rejected', 'accepted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check authorization
    if (application.job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application',
      });
    }

    application.status = status;
    if (employerNotes) {
      application.employerNotes = employerNotes;
    }
    await application.save();

    res.json({
      success: true,
      message: 'Application status updated',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/applications/:id
 * @desc    Get single application details
 * @access  Private (Candidate - own application, Employer - own job, Admin)
 */
exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company location jobType')
      .populate('candidate', 'name email phone');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check authorization
    const isCandidate = application.candidate._id.toString() === req.user._id.toString();
    const isEmployer = application.job.employer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCandidate && !isEmployer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application',
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
