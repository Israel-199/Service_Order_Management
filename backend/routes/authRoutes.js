const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

/**
 * @route POST /api/auth/login
 * @desc Authenticate admin user using credentials from environment variables
 * @access Public
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate request
  if (!email || !password) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Email and password are required',
    });
  }

  // Compare credentials with environment variables
  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid email or password',
    });
  }

  // Create JWT token payload with admin metadata
  const tokenPayload = {
    email,
    username: process.env.ADMIN_USERNAME,
    userid: process.env.ADMIN_USERID,
    role: 'admin',
  };

  // Sign the JWT with expiration
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: '3h',
  });

  // Respond with token and user info
  return res.status(200).json({
    message: 'Login successful',
    token,
    ...tokenPayload,
  });
});

/**
 * @route GET /api/auth/checkUser
 * @desc Verify JWT token and return admin info
 * @access Protected (admin only)
 */
router.get('/checkUser', auth, (req, res) => {
  res.status(200).json({
    message: 'Valid user',
    username: req.user.username,
    userid: req.user.userid,
    is_admin: req.user.role === 'admin',
  });
});

module.exports = router;
