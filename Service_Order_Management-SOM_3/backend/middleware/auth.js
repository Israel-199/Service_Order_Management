const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate and authorize admin users.
 * - Verifies JWT from HTTP-only cookie.
 * - Checks if user has the 'admin' role.
 */
const auth = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token missing from cookies',
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.role || decoded.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. Admins only.',
      });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

module.exports = { auth };
