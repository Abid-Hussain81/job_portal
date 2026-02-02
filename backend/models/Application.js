const mongoose = require('mongoose');

/**
 * Application Model
 * Links candidates to jobs they've applied for
 */
const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'rejected', 'accepted'],
      default: 'pending',
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
    },
    resumeURL: {
      type: String,
      required: [true, 'Resume is required'],
    },
    // Additional candidate information
    expectedSalary: {
      type: Number,
    },
    availableFrom: {
      type: Date,
    },
    // Employer notes (only visible to employer)
    employerNotes: {
      type: String,
    },
    // Interview scheduling
    interviewDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

// Index for faster queries
applicationSchema.index({ candidate: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
