const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate and authorize admin users
 * - Verifies JWT from Authorization header
 * - Checks if user has the 'admin' role
 */
const auth = (req, res, next) => {
  // Extract token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if token is missing
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token missing',
    });
  }

  try {
    // Verify the token using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Confirm that the user is an admin
    if (!decoded.role || decoded.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this resource',
      });
    }

    // Proceed to next middleware/handler
    next();
  } catch (error) {
    // Handle invalid or expired token
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

module.exports = { auth };
