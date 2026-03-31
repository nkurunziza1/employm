import { ApiError } from '../utils/ApiError.js';

/**
 * Central error handler: maps ApiError to JSON; hides stack traces in production.
 */
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err instanceof ApiError ? err.statusCode : 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message;

  const body = {
    success: false,
    error: message,
  };

  if (err instanceof ApiError && err.details) {
    body.details = err.details;
  }

  if (process.env.NODE_ENV !== 'production' && status === 500) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
}
