const mongoose = require('mongoose');

/**
 * Job Model
 * Represents job postings created by employers
 */
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      required: [true, 'Job type is required'],
    },
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior', 'Lead'],
      required: [true, 'Experience level is required'],
    },
    salaryRange: {
      min: {
        type: Number,
        required: [true, 'Minimum salary is required'],
      },
      max: {
        type: Number,
        required: [true, 'Maximum salary is required'],
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    requirements: {
      type: [String], // Array of required skills/qualifications
      required: [true, 'Job requirements are required'],
    },
    responsibilities: {
      type: [String], // Array of job responsibilities
    },
    benefits: {
      type: [String], // Array of benefits
    },
    // Reference to employer who posted the job
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Job status
    status: {
      type: String,
      enum: ['active', 'closed', 'pending'], // pending = awaiting admin approval
      default: 'active',
    },
    // Application deadline
    deadline: {
      type: Date,
    },
    // Number of positions available
    openings: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Track number of applications
    applicationCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searches
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ location: 1, jobType: 1, experienceLevel: 1 });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
