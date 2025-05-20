import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * Middleware function to handle errors.
 *
 * This middleware function catches errors, sets the HTTP response status code based on the error's status code,
 * and sends a JSON response with the error message and an `OK` status of false.
 *
 * @function errorHandlerMiddleware
 * @param {Object} err - The error object.
 * @param {number} [err.statusCode] - The HTTP status code to use for the response.
 * @param {string} [err.message] - The error message to send in the response.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function in the stack.
 */
const errorHandlerMiddleware = (
  err: { statusCode?: number; message?: string },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Something went wrong';

  res.status(statusCode).json({
    status: statusCode,
    message,
    ok: false,
  });
};
export default errorHandlerMiddleware;
