// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  name: string;
  errors?: { message: string }[];
}

function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err); // Log error for debugging

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' && err.errors) {
    const messages = err.errors.map(e => e.message);
    res.status(400).json({ error: 'Validation Error', messages });
    return;
  }

  // Handle custom errors with statusCode
  if (err.statusCode) {
    res.status(err.statusCode).json({ error: err.name || 'Error', message: err.message });
    return;
  }

  // Default to 500 Internal Server Error
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
}

export default errorHandler;
