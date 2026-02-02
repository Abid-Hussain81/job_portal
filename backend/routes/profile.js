const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

/**
 * Profile Routes
 * For candidate profile management
 */

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Private (Candidate only)
router.get('/me', authenticate, roleCheck(['candidate']), async (req, res, next) => {
  try {
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
// @access  Private (Candidate only)
router.put('/me', authenticate, roleCheck(['candidate']), async (req, res, next) => {
  try {
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
