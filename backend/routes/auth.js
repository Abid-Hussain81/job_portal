const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

/**
 * Authentication Routes
 * All routes are public except /me
 */

// @route   POST /api/auth/register
router.post('/register', authController.register);

// @route   POST /api/auth/login
router.post('/login', authController.login);

// @route   POST /api/auth/logout
router.post('/logout', authController.logout);

// @route   POST /api/auth/refresh
router.post('/refresh', authController.refresh);

// @route   GET /api/auth/me
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
