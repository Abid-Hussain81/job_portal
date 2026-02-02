const mongoose = require('mongoose');

/**
 * Profile Model
 * Extended profile information for candidates
 */
const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Professional summary
    summary: {
      type: String,
      maxlength: 500,
    },
    // Skills
    skills: {
      type: [String],
      default: [],
    },
    // Work experience
    experience: [
      {
        title: {
          type: String,
          required: true,
        },
        company: {
          type: String,
          required: true,
        },
        location: String,
        startDate: {
          type: Date,
          required: true,
        },
        endDate: Date, // null if current job
        isCurrent: {
          type: Boolean,
          default: false,
        },
        description: String,
      },
    ],
    // Education
    education: [
      {
        degree: {
          type: String,
          required: true,
        },
        institution: {
          type: String,
          required: true,
        },
        fieldOfStudy: String,
        startDate: {
          type: Date,
          required: true,
        },
        endDate: Date,
        grade: String,
      },
    ],
    // Resume/CV
    resumeURL: {
      type: String,
    },
    // Portfolio and social links
    portfolio: {
      website: String,
      linkedin: String,
      github: String,
      other: String,
    },
    // Preferences
    preferences: {
      jobTypes: {
        type: [String],
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      },
      locations: [String],
      expectedSalary: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: 'USD',
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
