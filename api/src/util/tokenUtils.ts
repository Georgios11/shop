import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_KEY, REFRESH_JWT_EXPIRES_IN } from './secrets'; // Importing directly from secrets
import { BadRequestError } from '../errors/apiError';

/**
 * Create a JWT token.
 *
 * @param {object} data - The payload to sign.
 * @returns {string} - The signed JWT token.
 */
export const createJWT = (data: object): string => {
  const token = jwt.sign(data, JWT_KEY, { expiresIn: JWT_EXPIRES_IN });
  return token;
};

/**
 * Create a refresh JWT token.
 *
 * @param {object} data - The payload to sign.
 * @returns {string} - The signed refresh JWT token.
 */
export const createRefreshJWT = (data: object): string => {
  const token = jwt.sign(data, JWT_KEY, { expiresIn: REFRESH_JWT_EXPIRES_IN });
  return token;
};

/**
 * Verifies a JWT token and returns the decoded data.
 *
 * @param {string} token - The JWT token to verify.
 * @returns {JwtPayload | string} - The decoded token data.
 * @throws {BadRequestError} - Throws an error if the token verification fails.
 */
export const verifyJWT = (token: string): string | JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_KEY);
    return decoded;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new BadRequestError('Token verification failed');
  }
};
