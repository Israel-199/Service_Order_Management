// middleware/errorHandler.js

function errorHandler(err, req, res, next) {
  console.error(err); // Log error for debugging

  // Customize Sequelize validation error response if needed
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({ error: 'Validation Error', messages });
  }

  // Handle custom errors thrown in services (with status code)
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.name || 'Error', message: err.message });
  }

  // Default to 500 Internal Server Error
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
}

module.exports = errorHandler;
