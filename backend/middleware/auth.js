const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate and authorize admin users.
 * - Verifies JWT from Authorization header.
 * - Checks if user has the 'admin' role.
 */
const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token missing or malformed',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.role || decoded.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. Admins only.',
      });
    }

    req.user = decoded; // Attach user info to the request object
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

module.exports = { auth };
