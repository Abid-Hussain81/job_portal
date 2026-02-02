const Job = require('../models/Job');
const { body, validationResult } = require('express-validator');

/**
 * Job Controller
 * Handles CRUD operations for job postings
 * 
 * WHY: Jobs are the core entity of our portal. This controller implements
 * advanced filtering, pagination, and search functionality.
 */

/**
 * @route   GET /api/jobs
 * @desc    Get all jobs with filters, search, and pagination
 * @access  Public
 */
exports.getAllJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      jobType,
      experienceLevel,
      minSalary,
      maxSalary,
      status = 'active',
    } = req.query;

    // Build filter object
    const filter = { status };

    // Text search across title, description, company
    if (search) {
      filter.$text = { $search: search };
    }

    // Location filter (case-insensitive partial match)
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Job type filter
    if (jobType) {
      filter.jobType = jobType;
    }

    // Experience level filter
    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    // Salary range filter
    if (minSalary || maxSalary) {
      filter['salaryRange.min'] = {};
      if (minSalary) filter['salaryRange.min'].$gte = Number(minSalary);
      if (maxSalary) filter['salaryRange.max'] = { $lte: Number(maxSalary) };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const jobs = await Job.find(filter)
      .populate('employer', 'name company email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
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
 * @route   GET /api/jobs/:id
 * @desc    Get single job by ID
 * @access  Public
 */
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name company email phone');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/jobs
 * @desc    Create a new job
 * @access  Private (Employer only)
 */
exports.createJob = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().notEmpty().withMessage('Job description is required'),
  body('company').trim().notEmpty().withMessage('Company name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('jobType').isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']).withMessage('Invalid job type'),
  body('experienceLevel').isIn(['Entry', 'Mid', 'Senior', 'Lead']).withMessage('Invalid experience level'),
  body('salaryRange.min').isNumeric().withMessage('Minimum salary must be a number'),
  body('salaryRange.max').isNumeric().withMessage('Maximum salary must be a number'),
  body('requirements').isArray({ min: 1 }).withMessage('At least one requirement is needed'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const jobData = {
        ...req.body,
        employer: req.user._id,
      };

      const job = await Job.create(jobData);

      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: job,
      });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update a job
 * @access  Private (Employer - own jobs only)
 */
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check if user is the employer who created this job
    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job',
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job
 * @access  Private (Employer - own jobs only, or Admin)
 */
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check authorization
    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job',
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/jobs/employer/my-jobs
 * @desc    Get jobs posted by current employer
 * @access  Private (Employer only)
 */
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};
