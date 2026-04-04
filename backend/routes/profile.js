const express = require('express');
const router = express.Router();
const path = require('path');
const Profile = require('../models/Profile');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { upload, uploadAvatar } = require('../middleware/upload');
const User = require('../models/User');

/**
 * Profile Routes
 * For candidate profile management
 */

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Private (Candidate, Admin)
router.get('/me', authenticate, roleCheck(['candidate', 'admin']), async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return res.json({
        success: true,
        data: {
          user: req.user,
          isAdmin: true
        },
      });
    }

    let profile = await Profile.findOne({ user: req.user._id });
    
    if (!profile) {
      // Create profile if it doesn't exist
      profile = await Profile.create({ user: req.user._id });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/profile/me
// @desc    Update current user's profile
// @access  Private (Candidate, Admin)
router.put('/me', authenticate, roleCheck(['candidate', 'admin']), async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const User = require('../models/User');
      const { name, phone } = req.body;
      const user = await User.findById(req.user._id);
      if (name) user.name = name;
      if (phone) user.phone = phone;
      await user.save();
      
      return res.json({
        success: true,
        message: 'Admin profile summary updated',
        data: { user },
      });
    }

    let profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      profile = await Profile.create({
        user: req.user._id,
        ...req.body,
      });
    } else {
      profile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        req.body,
        { new: true, runValidators: true }
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/profile/resume
// @desc    Upload resume for candidate
// @access  Private (Candidate)
router.post(
  '/resume',
  authenticate,
  roleCheck(['candidate']),
  upload.single('resume'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please attach a PDF or Word document.',
        });
      }

      // Build the public URL for the resume
      const resumeURL = `/uploads/resumes/${req.file.filename}`;

      // Update or create profile with resume URL
      let profile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { resumeURL },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      res.json({
        success: true,
        message: 'Resume uploaded successfully!',
        data: {
          resumeURL,
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/profile/resume
// @desc    Delete candidate's resume
// @access  Private (Candidate)
router.delete('/resume', authenticate, roleCheck(['candidate']), async (req, res, next) => {
  try {
    const fs = require('fs');
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile || !profile.resumeURL) {
      return res.status(404).json({ success: false, message: 'No resume found' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '..', profile.resumeURL);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Clear from profile
    profile.resumeURL = undefined;
    await profile.save();

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/profile/avatar
// @desc    Upload profile picture
// @access  Private
router.post(
  '/avatar',
  authenticate,
  uploadAvatar.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please attach a valid image.',
        });
      }

      // Build the public URL for the avatar
      const profilePicture = `/uploads/avatars/${req.file.filename}`;

      // Update the user document explicitly
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profilePicture },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Profile picture uploaded successfully!',
        data: {
          profilePicture: user.profilePicture,
        },
      });
    } catch (error) {
      if (error.message.includes('Only JPEG, PNG')) {
         return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
);

// @route   GET /api/profile/:userId
// @desc    Get profile by user ID (for employers viewing candidate profiles)
// @access  Private (Employer, Admin)
router.get('/:userId', authenticate, roleCheck(['employer', 'admin']), async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'name email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
