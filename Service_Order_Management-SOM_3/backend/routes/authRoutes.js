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

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Email and password are required',
    });
  }

  // Authenticate credentials
  const isEmailValid = email === process.env.ADMIN_EMAIL;
  const isPasswordValid = password === process.env.ADMIN_PASSWORD;

  if (!isEmailValid || !isPasswordValid) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid email or password',
    });
  }

  // Construct token payload
  const payload = {
    email,
    username: process.env.ADMIN_USERNAME,
    userid: process.env.ADMIN_USERID,
    role: 'admin',
  };

  // Generate JWT token
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '3h',
  });

  // Send token as HTTP-only cookie
  res
    .cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Send over HTTPS in production
      sameSite: 'strict',
      maxAge: 3 * 60 * 60 * 1000, // 3 hours
    })
    .status(200)
    .json({
      message: 'Login successful',
      user: {
        username: payload.username,
        userid: payload.userid,
        email: payload.email,
        role: payload.role,
      },
    });
});

module.exports = router;


/**
 * @route GET /api/auth/checkUser
 * @desc Verify JWT token and return admin info
 * @access Protected (admin only)
 */
router.get('/checkUser', auth, (req, res) => {
  const { username, userid, role } = req.user;

  res.status(200).json({
    message: 'Valid user',
    user: {
      username,
      userid,
      is_admin: role === 'admin',
    },
  });
});

module.exports = router;
