import { NextFunction, Request, Response } from 'express';
import mongoose, { FilterQuery, ObjectId } from 'mongoose';

import { StatusCodes } from 'http-status-codes';

import responseUtils from '../util/responseUtils';

import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/apiError';
import User, { UserDocument } from '../models/User';
import Product, { ProductDocument } from '../models/Product';
import Category, { CategoryDocument } from '../models/Category';
import globalRedisService from '../services/globalRedis.service';
import { getCacheKey, setCacheKey } from '../util/set-getRedisKeys';
import Order from '../models/Order';
import {
  createProductUtils,
  productControl,
  updateProductUtils,
} from '../util/productUtils';
import { CurrentUser } from '../types/currentUser';
import slugify from 'slugify';
import cloudinary from '../util/cloudinary';
import { ProductData } from '../types/product';

/**
 * @openapi
 * /api/v1/admin/users:
 *   get:
 *     summary: Retrieve all users
 *     description: Retrieves a list of all users. Requires admin privileges.
 *     tags:
 *       - Admin - Requires administrator privileges
 *     operationId: getAllUsers
 *     x-roles:
 *       - admin
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: Keyword to filter users by name or email.
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication with admin privileges
 *     responses:
 *       200:
 *         description: OK - Successfully retrieved users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Returned users 1-10 of 100"
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "605c72f2f1e4b8b1d6d9c1a2"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           email:
 *                             type: string
 *                             example: "johndoe@example.com"
 *                     pageNumber:
 *                       type: integer
 *                       example: 1
 *                     pages:
 *                       type: integer
 *                       example: 10
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
 *       403:
 *         description: Forbidden - User lacks the necessary admin privileges.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 message:
 *                   type: string
 *                   example: "Admin privileges required"
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

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await getCacheKey('users');

    responseUtils.successResponse(res, StatusCodes.OK, 'Returned all users', {
      users,
    });
  } catch (error: unknown) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     description: Fetches detailed information for a specific user by their unique ID. Requires admin privileges.
 *     tags:
 *       - Admin - Requires administrator privileges
 *     operationId: getUserById
 *     x-roles:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6720bc515b9baf8044f6d4b7"
 *         description: The unique identifier of the user to retrieve.
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication with admin privileges
 *     responses:
 *       200:
 *         description: OK - User details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Returned user with id 6720bc515b9baf8044f6d4b7"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "6720bc515b9baf8044f6d4b7"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "johndoe@example.com"
 *                         role:
 *                           type: string
 *                           example: "user"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
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
 *       403:
 *         description: Forbidden - User lacks the necessary admin privileges.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 message:
 *                   type: string
 *                   example: "Admin privileges required"
 *       404:
 *         description: Not Found - The specified user ID does not exist.
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
 *                   example: "User not found"
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

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    const user = await globalRedisService.findById(userId.toString(), 'users');

    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      `Returned user with id ${userId}`,
      { user }
    );
  } catch (error: unknown) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/admin/users/ban-user/{id}:
 *   patch:
 *     summary: Ban a user
 *     description: Bans a specified user by their unique ID. Only admins can access this endpoint. Cannot be used to ban other administrators.
 *     tags:
 *       - Admin - Requires administrator privileges
 *     operationId: banUser
 *     x-roles:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6720bc515b9baf8044f6d4b7"
 *         description: The unique identifier of the user to ban.
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication with admin privileges
 *     responses:
 *       200:
 *         description: OK - User successfully banned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User with id 6720bc515b9baf8044f6d4b7 has been banned"
 *                 data:
 *                   type: object
 *                   properties:
 *                     bannedUser:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "6720bc515b9baf8044f6d4b7"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "johndoe@example.com"
 *                         is_banned:
 *                           type: boolean
 *                           example: true
 *                         role:
 *                           type: string
 *                           example: "user"
 *       400:
 *         description: Bad Request - User is already banned.
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
 *                   example: "User with id 6720bc515b9baf8044f6d4b7 has been already banned"
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
 *       403:
 *         description: Forbidden - User lacks the necessary admin privileges or is trying to ban an administrator.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 message:
 *                   type: string
 *                   example: "You cannot ban an administrator. Please contact your manager"
 *       404:
 *         description: Not Found - The specified user ID does not exist.
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
 *                   example: "User not found"
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

export const banUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user: UserDocument = await globalRedisService.findById(
      id.toString(),
      'users'
    );
    if (user!.is_banned) {
      throw new BadRequestError(`User with id ${id} has been already banned`);
    }
    if (user!.role === 'admin')
      throw new UnauthorizedError(
        'You cannot ban an administrator. Please contact your manager'
      );

    const bannedUser = await User.findByIdAndUpdate(
      id,
      {
        is_banned: true,
      },
      { new: true }
    );

    //update cache for all users
    const users = await User.find();
    await setCacheKey('users', users);

    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      `User with id ${id} has been banned`,
      { bannedUser, users }
    );
  } catch (error: unknown) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/admin/users/unbann-user/{id}:
 *   patch:
 *     summary: Unban a user
 *     description: Unbans a specified user by their unique ID. Requires admin privileges.
 *     tags:
 *       - Admin - Requires administrator privileges
 *     operationId: unbannUser
 *     x-roles:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6720bc515b9baf8044f6d4b7"
 *         description: The unique identifier of the user to unban.
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication with admin privileges
 *     responses:
 *       200:
 *         description: OK - User successfully unbanned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User with id 6720bc515b9baf8044f6d4b7 has been unbanned"
 *                 data:
 *                   type: object
 *                   properties:
 *                     unbannedUser:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "6720bc515b9baf8044f6d4b7"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "johndoe@example.com"
 *                         is_banned:
 *                           type: boolean
 *                           example: false
 *                         role:
 *                           type: string
 *                           example: "user"
 *       400:
 *         description: Bad Request - User is not banned.
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
 *                   example: "User with id 6720bc515b9baf8044f6d4b7 is not banned"
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
 *       403:
 *         description: Forbidden - User lacks the necessary admin privileges.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 message:
 *                   type: string
 *                   example: "Admin privileges required"
 *       404:
 *         description: Not Found - The specified user ID does not exist or user unbanning failed.
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
 *                   example: "User not unbanned successfully"
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

export const unbannUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user: UserDocument = await globalRedisService.findById(
      id.toString(),
      'users'
    );
    if (!user!.is_banned) {
      throw new BadRequestError(`User with id ${id} is not banned`);
    }
    const unbannedUser = await User.findByIdAndUpdate(
      id,
      { is_banned: false },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!unbannedUser)
      throw new NotFoundError(`User not unbanned successfully`);

    //update cache for all users
    const users = await User.find();
    await setCacheKey('users', users);

    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      `User with id ${id} has been unbanned`,
      { unbannedUser, users }
    );
  } catch (error: unknown) {
    responseUtils.errorResponse(error, next);
  }
};
/**
 * @openapi
 * /api/v1/admin/users/change-user-status/{id}:
 *   patch:
 *     summary: Change user status
 *     description: Promotes a user to admin or demotes an admin to user based on their current role. Only accessible to admins.
 *     tags:
 *       - Admin - Requires administrator privileges
 *     operationId: changeUserStatus
 *     x-roles:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6720bc515b9baf8044f6d4b7"
 *         description: The unique identifier of the user whose status is to be changed.
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication with admin privileges
 *     responses:
 *       200:
 *         description: OK - User status successfully changed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User with id 6720bc515b9baf8044f6d4b7 promoted to admin"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedUser:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "6720bc515b9baf8044f6d4b7"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "johndoe@example.com"
 *                         role:
 *                           type: string
 *                           example: "admin"
 *                         is_banned:
 *                           type: boolean
 *                           example: false
 *       400:
 *         description: Bad Request - User is banned and cannot be promoted.
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
 *                   example: "User with id 6720bc515b9baf8044f6d4b7 is banned and cannot be promoted to administrator"
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
 *       403:
 *         description: Forbidden - User lacks the necessary admin privileges.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 message:
 *                   type: string
 *                   example: "Admin privileges required"
 *       404:
 *         description: Not Found - The specified user ID does not exist.
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
 *                   example: "User not found"
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

export const changeUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user: UserDocument = await globalRedisService.findById(
      id.toString(),
      'users'
    );

    if (user!.role === 'user') {
      if (user!.is_banned)
        throw new BadRequestError(
          `User with id ${id} is banned and cannot be promoted to administrator`
        );

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { role: 'admin' },
        { new: true }
      );

      //update cache for all users
      const users = await User.find();
      await setCacheKey('users', users);

      responseUtils.successResponse(
        res,
        StatusCodes.OK,
        `User with id ${id} promoted to admin`,
        { updatedUser, users }
      );
    }
    if (user!.role === 'admin') {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { role: 'user' },
        { new: true }
      );

      //update cache for all users
      const users = await User.find();
      await setCacheKey('users', users);

      responseUtils.successResponse(
        res,
        StatusCodes.OK,
        `Admin with id ${id} demoted to simple user`,
        { updatedUser, users }
      );
    }
  } catch (error: unknown) {
    responseUtils.errorResponse(error, next);
  }
};
/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete a user account
 *     description: Deletes a specified user account by their unique ID. Only accessible to admins. Cannot be used to delete administrator accounts.
 *     tags:
 *       - Admin - Requires administrator privileges
 *     operationId: deleteUserAccount
 *     x-roles:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6720bc515b9baf8044f6d4b7"
 *         description: The unique identifier of the user account to delete.
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication with admin privileges
 *     responses:
 *       200:
 *         description: OK - User account successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account with id 6720bc515b9baf8044f6d4b7 has been deleted"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedAccount:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "6720bc515b9baf8044f6d4b7"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "johndoe@example.com"
 *                         role:
 *                           type: string
 *                           example: "user"
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           role:
 *                             type: string
 *                           is_banned:
 *                             type: boolean
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
 *       403:
 *         description: Forbidden - User lacks the necessary admin privileges or is trying to delete an admin account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 message:
 *                   type: string
 *                   example: "You cannot delete an admin account. Please contact your manager"
 *       404:
 *         description: Not Found - The specified user ID does not exist.
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
 *                   example: "User not found"
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

export const deleteUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user: UserDocument = await globalRedisService.findById(
      id.toString(),
      'users'
    );
    if (user.role === 'admin') {
      throw new UnauthorizedError(
        `You cannot delete an admin account. Please contact your manager`
      );
    }
    const deletedAccount = await User.findByIdAndDelete(id);

    //update cache for all users
    const users = await User.find();
    await setCacheKey('users', users);

    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      `Account with id ${id} has been deleted`,
      { deletedAccount, users }
    );
  } catch (error: unknown) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/admin/products:
 *   post:
 *     summary: Create a new product
 *     description: Creates a new product in the system. Only accessible to admins.
 *     tags:
 *       - Admin - Requires administrator privileges
 *     operationId: createProduct
 *     x-roles:
 *       - admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Smartphone"
 *                 description: The name of the product to be created.
 *               description:
 *                 type: string
 *                 example: "Latest model smartphone with high-resolution display."
 *               price:
 *                 type: number
 *                 example: 999.99
 *                 description: The price of the product.
 *               category:
 *                 type: string
 *                 example: "Electronics"
 *                 description: The category to which the product belongs.
 *             required:
 *               - name
 *               - price
 *               - category
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication with admin privileges
 *     responses:
 *       201:
 *         description: Created - Product successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product created"
 *                 data:
 *                   type: object
 *                   properties:
 *                     newProduct:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "605c72f2f1e4b8b1d6d9c1a2"
 *                         name:
 *                           type: string
 *                           example: "Smartphone"
 *                         description:
 *                           type: string
 *                           example: "Latest model smartphone with high-resolution display."
 *                         price:
 *                           type: number
 *                           example: 999.99
 *                         category:
 *                           type: string
 *                           example: "Electronics"
 *                         createdBy:
 *                           type: string
 *                           example: "605c72f2f1e4b8b1d6d9c1a2"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
 *       400:
 *         description: Bad Request - Product name is missing or already exists.
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
 *                   example: "Product with name Smartphone already exists"
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
 *       403:
 *         description: Forbidden - User lacks the necessary admin privileges.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 message:
 *                   type: string
 *                   example: "Admin privileges required"
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

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUser = req.user as CurrentUser;
    const userId = currentUser.userId;
    // Extract name, category, price, and image from request body and file
    const { name, category, price } = req.body;
    const image = req.file as Express.Multer.File | undefined; // Type assertion for multer file type

    // Check if the product already exists and if the category is valid
    await productControl(name, category);

    // Get the user ID of the creator from request (assumes req.user is populated by authentication middleware)
    const createdBy = userId;
    if (!createdBy) {
      throw new BadRequestError('User ID is required to create a product');
    }

    // Generate a slug for the product name
    const slug = slugify(name);

    // Get image path as string
    const imagePath = image ? image.path : undefined;

    // Construct product data to pass to the utility function
    const productData: ProductData = {
      ...req.body,
      category: {
        name: category,
        slug: slugify(category),
      },
      createdBy: userId,
      slug,
      image: imagePath,
    };
    const newProduct = await createProductUtils(productData);
    // Fetch products and categories in parallel and update cache
    const [products, categories] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).exec(),
      Category.find(),
    ]);

    await Promise.all([
      setCacheKey('products', products),
      setCacheKey('categories', categories),
    ]);
    // Send a success response with the newly created product
    responseUtils.successResponse(res, StatusCodes.CREATED, 'Product created', {
      newProduct,
      products,
      categories,
    });
  } catch (error) {
    // Pass the error to the next middleware
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/admin/products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Updates an existing product by its unique ID. Only accessible to admins.
 *     tags:
 *       - Admin - Requires administrator privileges
 *     operationId: updateProduct
 *     x-roles:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6727dd0b9d6be5ac8a339cbd"
 *         description: The unique identifier of the product to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Product Name"
 *               description:
 *                 type: string
 *                 example: "Updated description of the product."
 *               price:
 *                 type: number
 *                 example: 1199.99
 *               category:
 *                 type: string
 *                 example: "Updated Category"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "Optional image file to update the product's image"
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication with admin privileges
 *     responses:
 *       200:
 *         description: OK - Product successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product with id 6727dd0b9d6be5ac8a339cbd updated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedProduct:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "6727dd0b9d6be5ac8a339cbd"
 *                         name:
 *                           type: string
 *                           example: "Updated Product Name"
 *                         description:
 *                           type: string
 *                           example: "Updated description of the product."
 *                         price:
 *                           type: number
 *                           example: 1199.99
 *                         category:
 *                           type: string
 *                           example: "Updated Category"
 *                         slug:
 *                           type: string
 *                           example: "updated-product-name"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T11:23:45.123Z"
 *       400:
 *         description: Bad Request - Product not updated.
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
 *                   example: "Product not updated"
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
 *       403:
 *         description: Forbidden - User lacks the necessary admin privileges.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 message:
 *                   type: string
 *                   example: "Admin privileges required"
 *       404:
 *         description: Not Found - The specified product ID does not exist.
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
 *                   example: "Product with id 6727dd0b9d6be5ac8a339cbd not found"
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

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = req.params.id;

    // Retrieve product by ID, throw an error if not found
    const product = (await globalRedisService.findById(
      productId,
      'products'
    )) as ProductDocument;

    const image = req.file as Express.Multer.File | null; // Ensure image is either a file or null

    // Prepare product data for update
    const productData = { ...req.body };
    productData.slug = req.body.name ? slugify(req.body.name) : product.slug;

    // Update product in the database and handle image upload if applicable
    // Update the product in the database and handle image upload if applicable
    const updatedProduct = (await updateProductUtils(
      image || null,
      productId,
      productData
    )) as ProductDocument;

    if (!updatedProduct) {
      throw new BadRequestError('Product not updated');
    }

    const products = await getCacheKey('products');
    // Send a success response with the updated product
    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      `Product with id ${productId} updated`,
      { updatedProduct, products }
    );
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/admin/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Deletes a specified product by its unique ID. Only accessible to admins.
 *     tags:
 *       - Admin - Requires administrator privileges
 *     operationId: deleteProduct
 *     x-roles:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6720bc515b9baf8044f6d4c3"
 *         description: The unique identifier of the product to delete.
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication with admin privileges
 *     responses:
 *       200:
 *         description: OK - Product successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product with id 6720bc515b9baf8044f6d4c3 deleted"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedProduct:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "6720bc515b9baf8044f6d4c3"
 *                         name:
 *                           type: string
 *                           example: "Sample Product"
 *                         description:
 *                           type: string
 *                           example: "A high-quality sample product."
 *                         price:
 *                           type: number
 *                           example: 99.99
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
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
 *       403:
 *         description: Forbidden - User lacks the necessary admin privileges.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 message:
 *                   type: string
 *                   example: "Admin privileges required"
 *       404:
 *         description: Not Found - The specified product ID does not exist.
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
 *                   example: "Product not found"
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

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const product = (await globalRedisService.findById(
      id.toString(),
      'products'
    )) as ProductDocument;

    // Delete image from Cloudinary if it exists
    if (product.image) {
      try {
        // Extract public_id from the Cloudinary URL
        const urlParts = product.image.split('/');
        const filenameWithExtension = urlParts[urlParts.length - 1];
        const publicId = `products/${filenameWithExtension.split('.')[0]}`;

        const result = await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.log('Error deleting image from Cloudinary:', cloudinaryError);
      }
    }

    // Update the category by removing the product ID from its products array
    const updatedCategory = await Category.findOneAndUpdate(
      { name: product.category.name },
      {
        $pull: { products: id },
      },
      { new: true }
    );

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      throw new BadRequestError(`Product with id ${id} not deleted`);
    }

    // Get fresh data from database
    const categories = await Category.find();
    const products = await Product.find();

    // Update both caches with fresh data
    await Promise.all([
      setCacheKey('categories', categories),
      setCacheKey('products', products),
    ]);

    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      `Product with id ${id} deleted`,
      { deletedProduct, products, categories }
    );
  } catch (error: unknown) {
    console.log('Error in deleteProduct:', error);
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/admin/orders:
 *   get:
 *     summary: Retrieve all orders
 *     description: Retrieves a list of all orders. Only accessible to admins.
 *     tags:
 *       - Admin - Requires administrator privileges
 *     operationId: getAllOrders
 *     x-roles:
 *       - admin
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional keyword to filter orders by criteria like customer name or product.
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication with admin privileges
 *     responses:
 *       200:
 *         description: OK - Successfully retrieved orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Returned Orders 1-10 of 100"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "605c72f2f1e4b8b1d6d9c1a2"
 *                           user:
 *                             type: string
 *                             example: "605c72f2f1e4b8b1d6d9c1a2"
 *                           totalPrice:
 *                             type: number
 *                             example: 199.99
 *                           orderItems:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 productId:
 *                                   type: string
 *                                   example: "67260c7120390f8045c40f5b"
 *                                 name:
 *                                   type: string
 *                                   example: "Sample Product"
 *                                 quantity:
 *                                   type: integer
 *                                   example: 1
 *                                 price:
 *                                   type: number
 *                                   example: 29.99
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-03-21T10:23:45.123Z"
 *                           status:
 *                             type: string
 *                             example: "Pending"
 *                     pageNumber:
 *                       type: integer
 *                       example: 1
 *                     pages:
 *                       type: integer
 *                       example: 10
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
 *       403:
 *         description: Forbidden - User lacks the necessary admin privileges.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 message:
 *                   type: string
 *                   example: "Admin privileges required"
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

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await getCacheKey('orders');

    // If no orders in cache, get from database
    if (!orders || !orders.length) {
      const dbOrders = await Order.find();
      await setCacheKey('orders', dbOrders);
      responseUtils.successResponse(
        res,
        StatusCodes.OK,
        'Returned all orders',
        {
          orders: dbOrders,
        }
      );
      return;
    }

    responseUtils.successResponse(res, StatusCodes.OK, 'Returned all orders', {
      orders,
    });
  } catch (error: unknown) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/admin/orders/{id}:
 *   get:
 *     summary: Retrieve a single order by ID
 *     description: Fetches detailed information for a specific order by its unique ID. Only accessible to admins.
 *     tags:
 *       - Admin - Requires administrator privileges
 *     operationId: getSingleOrder
 *     x-roles:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "67261d6c5f8193224501cc16"
 *         description: The unique identifier of the order to retrieve.
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication with admin privileges
 *     responses:
 *       200:
 *         description: OK - Order details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Returned order with id 67261d6c5f8193224501cc16"
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "67261d6c5f8193224501cc16"
 *                         user:
 *                           type: string
 *                           example: "605c72f2f1e4b8b1d6d9c1a2"
 *                         totalPrice:
 *                           type: number
 *                           example: 199.99
 *                         orderItems:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               productId:
 *                                 type: string
 *                                 example: "67260c7120390f8045c40f5b"
 *                               name:
 *                                 type: string
 *                                 example: "Sample Product"
 *                               quantity:
 *                                 type: integer
 *                                 example: 1
 *                               price:
 *                                 type: number
 *                                 example: 29.99
 *                         status:
 *                           type: string
 *                           example: "Pending"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T12:30:25.123Z"
 *       400:
 *         description: Bad Request - Order ID is invalid or not found.
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
 *                   example: "Order with id 67261d6c5f8193224501cc16 not found"
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
 *       403:
 *         description: Forbidden - User lacks the necessary admin privileges.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 message:
 *                   type: string
 *                   example: "Admin privileges required"
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

export const getSingleOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Retrieve the order by ID
    const order = await globalRedisService.findById(id, 'orders');
    if (!order) {
      throw new BadRequestError(`Order with id ${id} not found`);
    }

    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      `Returned order with id ${id}`,
      { order }
    );
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/admin/categories:
 *   post:
 *     summary: Create a new category
 *     description: Creates a new category in the system. Only accessible to admins.
 *     tags:
 *       - Admin - Requires administrator privileges
 *     operationId: createCategory
 *     x-roles:
 *       - admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *                 description: The name of the category to be created.
 *             required:
 *               - name
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication with admin privileges
 *     responses:
 *       201:
 *         description: Created - Category successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category created"
 *                 data:
 *                   type: object
 *                   properties:
 *                     newCategory:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "605c72f2f1e4b8b1d6d9c1a2"
 *                         name:
 *                           type: string
 *                           example: "Electronics"
 *                         slug:
 *                           type: string
 *                           example: "electronics"
 *                         createdBy:
 *                           type: string
 *                           example: "605c72f2f1e4b8b1d6d9c1a2"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
 *       400:
 *         description: Bad Request - Category name is missing or already exists.
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
 *                   example: "Category with name Electronics already exists"
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
 *       403:
 *         description: Forbidden - User lacks the necessary admin privileges.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 message:
 *                   type: string
 *                   example: "Admin privileges required"
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

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUser = req.user as CurrentUser;

    const { name } = req.body;
    const slug = slugify(name);
    const createdBy = currentUser.userId;

    // Ensure `createdBy` exists (user should be authenticated)
    if (!createdBy) {
      throw new BadRequestError('User ID is required to create a category');
    }

    // Check if the category already exists
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      throw new BadRequestError(`Category with name ${name} already exists`);
    }

    // Create a new category
    const newCategory = await Category.create({ name, slug, createdBy });

    // Update the cache with the new category
    const categories = await getCacheKey('categories');
    categories.push(newCategory);
    await setCacheKey('categories', categories);

    // Send a success response with the new category
    responseUtils.successResponse(
      res,
      StatusCodes.CREATED,
      'Category created',
      {
        newCategory,
      }
    );
  } catch (error) {
    // Pass any errors to the next middleware for centralized error handling
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/admin/categories/{id}:
 *   put:
 *     summary: Update a category
 *     description: Updates an existing category by its unique ID. Only accessible to admins.
 *     tags:
 *       - Admin - Requires administrator privileges
 *     operationId: updateCategory
 *     x-roles:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6727e6e036304a404bbfbbc3"
 *         description: The unique identifier of the category to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Electronics"
 *                 description: Optional new name for the category.
 *               description:
 *                 type: string
 *                 example: "Updated category for electronic products."
 *               is_discounted:
 *                 type: boolean
 *                 example: true
 *                 description: Indicates if the category is discounted.
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication with admin privileges
 *     responses:
 *       200:
 *         description: OK - Category successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedCategory:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "6727e6e036304a404bbfbbc3"
 *                         name:
 *                           type: string
 *                           example: "Updated Electronics"
 *                         description:
 *                           type: string
 *                           example: "Updated category for electronic products."
 *                         is_discounted:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T12:45:45.123Z"
 *       400:
 *         description: Bad Request - Invalid data provided for category update.
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
 *                   example: "Invalid data provided for category update"
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
 *       403:
 *         description: Forbidden - User lacks the necessary admin privileges.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 message:
 *                   type: string
 *                   example: "Admin privileges required"
 *       404:
 *         description: Not Found - The specified category ID does not exist.
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
 *                   example: "Category with ID 6727e6e036304a404bbfbbc3 not found or not updated"
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

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Ensure the category exists before attempting update
    await globalRedisService.findById(id, 'categories');

    const { is_discounted } = req.body;

    // Uncomment the following if specific discounted category logic is needed
    /*
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        $set: { is_discounted },
      },
      { new: true, runValidators: true },
    );
    */

    // Update category with general fields
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    // Check if the category was updated
    if (!updatedCategory) {
      throw new NotFoundError(
        `Category with ID ${id} not found or not updated`
      );
    }

    // Update the cache with the updated category
    const categories = (await getCacheKey('categories')) as CategoryDocument[];

    // Update the products array with the newly updated product
    const updatedCategories: CategoryDocument[] = categories.map((category) =>
      String(category._id) === String(updatedCategory._id)
        ? updatedCategory
        : category
    );

    // Set the updated categories array back into the cache
    await setCacheKey('categories', updatedCategories);

    // Send a success response with the updated category
    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      'Category updated successfully',
      { updatedCategory }
    );
  } catch (error) {
    // Pass any errors to the next middleware for centralized error handling
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/admin/categories/{id}:
 *   delete:
 *     summary: Delete a category and its associated products
 *     description: Deletes a specified category by its unique ID and removes all products associated with it. Only accessible to admins.
 *     tags:
 *       - Admin - Requires administrator privileges
 *     operationId: deleteCategory
 *     x-roles:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "67209ee6d17f9b212323de9a"
 *         description: The unique identifier of the category to delete.
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication with admin privileges
 *     responses:
 *       200:
 *         description: OK - Category and all associated products successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category with id 67209ee6d17f9b212323de9a, and all its products were deleted"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCategory:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "67209ee6d17f9b212323de9a"
 *                         name:
 *                           type: string
 *                           example: "Electronics"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T12:30:25.123Z"
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
 *       403:
 *         description: Forbidden - User lacks the necessary admin privileges.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 message:
 *                   type: string
 *                   example: "Admin privileges required"
 *       404:
 *         description: Not Found - The specified category ID does not exist.
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
 *                   example: "Category not found"
 *       500:
 *         description: Internal Server Error - An unexpected error occurred during deletion.
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
 *                   example: "Failed to delete category or its associated products"
 */

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Ensure the category exists
    await globalRedisService.findById(id.toString(), 'categories');

    // Delete the category
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return next(
        new InternalServerError(`Failed to delete category with id ${id}`)
      );
    }

    // Delete all products that reference this category by ID
    const deletedProducts = await Product.deleteMany({
      'category.id': deletedCategory._id,
    });

    if (!deletedProducts) {
      return next(
        new InternalServerError(
          `Failed to delete products under ${deletedCategory.name} category`
        )
      );
    }
    //update cache by removing deleted items
    const cachedCategories = (await getCacheKey('categories')) || [];
    const cachedProducts = (await getCacheKey('products')) || [];

    // Filter out the deleted category and its products from cache
    const categories = cachedCategories.filter(
      (category: CategoryDocument) => String(category._id) !== String(id)
    );
    const products = cachedProducts.filter(
      (product: ProductDocument) => String(product.category.id) !== String(id)
    );

    // Update both caches with filtered data
    await Promise.all([
      setCacheKey('categories', categories),
      setCacheKey('products', products),
    ]);

    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      `Category with id ${id}, and all its products were deleted`,
      { deletedCategory, categories, products }
    );
  } catch (error: unknown) {
    responseUtils.errorResponse(error, next);
  }
};
