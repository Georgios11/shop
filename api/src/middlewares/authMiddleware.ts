import { Request, Response, NextFunction, RequestHandler } from 'express';
import { UnauthenticatedError, UnauthorizedError } from '../errors/apiError';

import passport from 'passport';
import { UserDocument } from '../models/User';

/**
 * Middleware to authorize a user based on JWT authentication.
 * This function uses Passport to authenticate the user with a JWT strategy.
 * If authentication is successful, the user information is attached to `req.user`.
 * If authentication fails, an appropriate error is passed to `next()` to handle.
 *
 * @param {Request} req - The request object from the client.
 * @param {Response} res - The response object for sending responses.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {UnauthenticatedError} If authentication fails due to invalid or missing credentials.
 */
export const authorizeUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    'jwt',
    { session: false },
    async (err: Error | null, user: UserDocument | null) => {
      if (err) {
        console.error('Passport error:', err);
        return next(new UnauthenticatedError('Authentication invalid'));
      }

      if (!user) {
        return next(new UnauthenticatedError('Please log in'));
      }

      const { _id: userId, password, ...userInfo } = user.toObject(); // Convert Mongoose document to plain object

      req.user = { userId, ...userInfo };

      next();
    }
  )(req, res, next);
};
/**
 * Middleware to authorize an admin user based on JWT authentication.
 * This function uses Passport to authenticate the user with a JWT strategy.
 * If authentication is successful and the user has an admin role, the user information is attached to `req.user`.
 * If authentication fails or the user does not have admin privileges, an appropriate error is passed to `next()` to handle.
 *
 * @param {Request} req - The request object from the client.
 * @param {Response} res - The response object for sending responses.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {UnauthenticatedError} If authentication fails due to invalid or missing credentials.
 * @throws {UnauthorizedError} If the user does not have admin privileges.
 */
export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error | null, user: UserDocument | null) => {
      if (err) {
        console.error('Passport error:', err);
        return next(new UnauthenticatedError('Authentication invalid'));
      }

      if (!user) {
        return next(new UnauthenticatedError('Please log in'));
      }

      if (user.role !== 'admin') {
        return next(new UnauthorizedError('Administrator access only'));
      }

      const { _id: userId, password, ...userInfo } = user.toObject(); // Convert Mongoose document to plain object
      req.user = { userId, ...userInfo };

      next();
    }
  )(req, res, next);
};
