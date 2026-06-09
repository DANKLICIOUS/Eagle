import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors with HTTP status codes.
 * Used for throwing known errors that should return specific HTTP responses.
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Express error handling middleware.
 * Catches all errors and returns appropriate HTTP responses.
 * Must be registered as the last middleware in the app.
 *
 * @param err - The error that was thrown
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function (unused but required by Express)
 */
export function errorHandler(
  err: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error handler:', {
    name: err.name,
    message: err.message,
    path: req.path,
    method: req.method,
    ...(err instanceof APIError && { statusCode: err.statusCode }),
  });

  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  // Default to 500 for unexpected errors
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    statusCode: 500,
  });
}
