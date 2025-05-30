import { Request, Response, NextFunction } from 'express';

import responseUtils from '../util/responseUtils';
import { BadRequestError, NotFoundError } from '../errors/apiError';
import { createRefreshJWT, verifyJWT } from '../util/tokenUtils';
import { StatusCodes } from 'http-status-codes';
import { getDomain } from '../util/secrets';

/**
 * @openapi
 * /api/v1/users/refresh-token:
 *   post:
 *     summary: Refresh the user's authentication token
 *     description: Generates a new authentication token using the existing token in the user's cookies.
 *     tags:
 *       - Token
 *     operationId: refreshToken
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication
 *     responses:
 *       200:
 *         description: OK - New authentication token generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token refreshed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     newToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad Request - No cookie found or invalid token format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "No cookie found"
 *       401:
 *         description: Unauthorized - User is not logged in or token is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 message:
 *                   type: string
 *                   example: "Authorization token missing or invalid"
 *       404:
 *         description: Not Found - Token not found in cookies.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not Found"
 *                 message:
 *                   type: string
 *                   example: "No token found"
 *       500:
 *         description: Internal Server Error - An unexpected error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred on the server."
 */

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if the request contains a cookie
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      throw new BadRequestError('No cookie found');
    }

    // Extract the old token from the cookie
    const oldToken = cookieHeader.split('=')[1];

    // Clear both the token and refreshToken cookies
    res.clearCookie('token', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: getDomain(),
    });

    // Check if the token exists in the cookie
    if (!oldToken) {
      throw new NotFoundError('No token found');
    }

    // Verify the old token and extract user information
    const decodedToken = verifyJWT(oldToken);
    if (typeof decodedToken === 'string') {
      throw new BadRequestError('Invalid token format');
    }
    const { userId, role } = decodedToken;

    // Create a new token with the extracted user information
    const newToken = createRefreshJWT({ userId, role });

    // Set the expiration time for the new token
    const expiresIn = 1000 * 60 * 59; // 59 minutes

    // Set the new token in the cookie
    res.cookie('refreshToken', newToken, {
      path: '/',
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: getDomain(),
    });

    // Send success response with the new token
    responseUtils.successResponse(res, StatusCodes.OK, 'Token refreshed', {
      newToken,
    });
  } catch (error) {
    // Pass any errors to the next middleware for centralized error handling
    responseUtils.errorResponse(error, next);
  }
};
