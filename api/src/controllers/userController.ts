import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import responseUtils from '../util/responseUtils';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/apiError';
import User, { UserDocument } from '../models/User';

import {
  addProductToFavorites,
  removeFavoriteProduct,
} from '../util/productUtils';
import { AuthenticatedRequest } from '../types/authenticateRequest';
import globalRedisService from '../services/globalRedis.service';
import { getCacheKey, setCacheKey } from '../util/set-getRedisKeys';
import { CurrentUser } from '../types/currentUser';
import updateUserUtils from '../util/updateUserUtils';
import { redisClient } from '../util/redisClient';
import mongoose from 'mongoose';
import { addItem } from '../util/cartUtils';
import { modifyCartItemQuantity } from '../util/cartUtils';
import { updateProductStock } from '../util/cartUtils';
import { updateUserCart } from '../util/cartUtils';
import { calculateTotalPrice } from '../util/cartUtils';
import { OrderDocument } from '../models/Order';
import Order from '../models/Order';
import Product from '../models/Product';
import { getDomain } from '../util/secrets';

/**
 * @openapi
 * /api/v1/users/logout:
 *   post:
 *     summary: Log out the current user
 *     description: Logs out the current user by clearing the session token.
 *     tags:
 *       - User - Requires logged in privileges
 *     operationId: logoutUser
 *     x-roles:
 *       - user
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication
 *     responses:
 *       200:
 *         description: OK - User successfully logged out.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You have logged out"
 *       401:
 *         description: Unauthorized - User is not logged in or session is invalid.
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
 *       500:
 *         description: Internal Server Error - An unexpected error occurred during logout.
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

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Clear both token and refreshToken cookies
    res.clearCookie('token', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: getDomain(),
    });
    res.clearCookie('refreshToken', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: getDomain(),
    });

    // Remove the user from the request object
    delete req.user;
    // Send success response
    responseUtils.successResponse(res, StatusCodes.OK, 'You have logged out');
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/users/add-favorite/{id}:
 *   post:
 *     summary: Add a product to user's favorites
 *     description: Adds a specified product to the logged-in user's list of favorite products.
 *     tags:
 *       - User - Requires logged in privileges
 *     operationId: favoriteProduct
 *     x-roles:
 *       - user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "67251fc45446c51e05d7f705"
 *         description: The unique identifier of the product to add to favorites.
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication
 *     responses:
 *       200:
 *         description: OK - Product successfully added to favorites.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product has been added to your favorites"
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: "Sample Product Name"
 *       401:
 *         description: Unauthorized - User is not logged in or session is invalid.
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

export const favoriteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    // Extract currentUser from req.user, populated by authorizeUser middleware

    const userId = (req as AuthenticatedRequest).user!.userId;

    // Add the product to the user's favorites

    const { updatedProduct } = await addProductToFavorites(
      id,
      userId.toString()
    );

    // Send success response indicating the product has been added to favorites
    if (updatedProduct.itemsInStock === 0) {
      responseUtils.successResponse(
        res,
        StatusCodes.OK,
        `Product ${updatedProduct.name} has been added to your favorites. Unfortunately it is out of stock. You will be notified as soon as it becomes available`
      );
    } else {
      const products = await getCacheKey('products');
      const users = await getCacheKey('users');
      responseUtils.successResponse(
        res,
        StatusCodes.OK,
        'Product has been added to your favorites',
        { product: updatedProduct, products, users }
      );
    }
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/users/delete-favorite/{id}:
 *   delete:
 *     summary: Remove a product from user's favorites
 *     description: Removes a specified product from the logged-in user's list of favorite products.
 *     tags:
 *       - User - Requires logged in privileges
 *     operationId: deleteFavoriteProduct
 *     x-roles:
 *       - user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "67212c616f383dcd4fdc75b6"
 *         description: The unique identifier of the product to remove from favorites.
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication
 *     responses:
 *       200:
 *         description: OK - Product successfully removed from favorites.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product has been removed from your favorites"
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: "Sample Product Name"
 *       401:
 *         description: Unauthorized - User is not logged in or session is invalid.
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
 *         description: Not Found - The specified product ID does not exist in favorites.
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
 *                   example: "Product not found in favorites"
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

export const removeFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user!.userId;

    // Remove the product from the user's favorites
    const { updatedProduct, updatedUser } = await removeFavoriteProduct(
      id,
      userId
    );
    const products = await getCacheKey('products');
    const users = await getCacheKey('users');

    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      'Product has been removed from your favorites',
      { product: updatedProduct, products, users, currentUser: updatedUser }
    );
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/users/orders:
 *   get:
 *     summary: Retrieve user's orders
 *     description: Retrieves a list of all orders placed by the logged-in user.
 *     tags:
 *       - User - Requires logged in privileges
 *     operationId: getUserOrders
 *     x-roles:
 *       - user
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication
 *     responses:
 *       200:
 *         description: OK - User's orders retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Your orders"
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
 *                           totalPrice:
 *                             type: number
 *                             example: 299.99
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
 *                             example: "Delivered"
 *       401:
 *         description: Unauthorized - User is not logged in or session is invalid.
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
 *                   example: "User with id 605c72f2f1e4b8b1d6d9c1a2 not found"
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

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const user: UserDocument = await globalRedisService.findById(
      userId.toString(),
      'users'
    );
    if (!user) throw new NotFoundError(`User with id ${userId} not found`);
    const { orders } = user;
    if (!orders?.length) {
      responseUtils.successResponse(
        res,
        StatusCodes.OK,
        'You have placed no orders'
      );
    } else {
      responseUtils.successResponse(res, StatusCodes.OK, 'Your orders', {
        orders,
      });
    }
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/users/favorites:
 *   get:
 *     summary: Retrieve user's favorite products
 *     description: Retrieves a list of all favorite products saved by the logged-in user.
 *     tags:
 *       - User - Requires logged in privileges
 *     operationId: getUserFavorites
 *     x-roles:
 *       - user
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication
 *     responses:
 *       200:
 *         description: OK - User's favorite products retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Your favorite products"
 *                 data:
 *                   type: object
 *                   properties:
 *                     favorites:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             example: "67260c7120390f8045c40f5b"
 *                           name:
 *                             type: string
 *                             example: "Sample Product Name"
 *                           price:
 *                             type: number
 *                             example: 29.99
 *                           itemsInStock:
 *                             type: integer
 *                             example: 10
 *                           category:
 *                             type: string
 *                             example: "Electronics"
 *       401:
 *         description: Unauthorized - User is not logged in or session is invalid.
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
 *                   example: "User with id 605c72f2f1e4b8b1d6d9c1a2 not found"
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

export const getFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const user: UserDocument = await globalRedisService.findById(
      userId.toString(),
      'users'
    );
    if (!user) throw new NotFoundError(`User with id ${userId} not found`);
    const favorites = user.favorites;

    if (!favorites?.length) {
      responseUtils.successResponse(
        res,
        StatusCodes.OK,
        'You have no favorite products'
      );
    } else {
      responseUtils.successResponse(
        res,
        StatusCodes.OK,
        'Your favorite products',

        { favorites }
      );
    }
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/users/account:
 *   delete:
 *     summary: Delete user account
 *     description: Deletes the logged-in user's account and removes associated data from the cache.
 *     tags:
 *       - User - Requires logged in privileges
 *     operationId: deleteUserAccount
 *     x-roles:
 *       - user
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication
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
 *                   example: "Account user@example.com has been deactivated"
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - User is not logged in or session is invalid.
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

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // const userId = (req as AuthenticatedRequest).user!.userId;
    const currentUser = await getCacheKey('currentUser');
    const userId = currentUser._id;
    const deletedAccount = await User.findByIdAndDelete(userId);
    if (!deletedAccount) throw new BadRequestError('Account not deleted');
    await redisClient.del(`currentUser`);

    const users = await User.find().select('-password');
    await setCacheKey('users', users);

    // Throw an error if the account deletion fails
    if (!deletedAccount) throw new Error('Account not deleted');

    // Clear the authentication cookie
    res.clearCookie(userId, {
      httpOnly: true,
      secure: true, // Ensures the cookie is only sent over HTTPS (required for cross-site cookies)
      sameSite: 'none', // Allows the cookie to be sent in cross-site requests
      expires: new Date(Date.now()), // Set the cookie to expire immediately
      path: '/', // Ensures the cookie is cleared for the entire domain
    });

    // Delete the user from the request object
    delete req.user;

    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      `Deleted account ${deletedAccount.email}`,
      { deletedAccount, users }
    );
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/users/profile:
 *   get:
 *     summary: Retrieve logged-in user's profile
 *     description: Fetches the profile details of the currently authenticated user.
 *     tags:
 *       - User - Requires logged in privileges
 *     operationId: getUserProfile
 *     x-roles:
 *       - user
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication
 *     responses:
 *       200:
 *         description: OK - User profile details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Your account details"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "605c72f2f1e4b8b1d6d9c1a2"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     role:
 *                       type: string
 *                       example: "user"
 *                     favorites:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "67260c7120390f8045c40f5b"
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "605c72f2f1e4b8b1d6d9c1a2"
 *       401:
 *         description: Unauthorized - User is not logged in or session is invalid.
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

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUser = req.user as CurrentUser;

    responseUtils.successResponse(res, StatusCodes.OK, `Your account details`, {
      ...currentUser,
    });
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/users/update-user:
 *   put:
 *     summary: Update logged-in user's information
 *     description: Updates the profile information of the logged-in user, including optional image upload.
 *     tags:
 *       - User - Requires logged in privileges
 *     operationId: updateUserProfile
 *     x-roles:
 *       - user
 *     security:
 *       - bearerAuth: [] # Requires Bearer token authentication
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 example: "janedoe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "newpassword123"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional profile image file
 *     responses:
 *       200:
 *         description: OK - User information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *       400:
 *         description: Bad Request - Invalid or missing data provided for user update.
 *       401:
 *         description: Unauthorized - User is not logged in or session is invalid.
 *       404:
 *         description: Not Found - The specified user ID does not exist.
 *       500:
 *         description: Internal Server Error - An unexpected error occurred.
 */

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = (req.user as CurrentUser).userId;

    // Extract updated user data from request body
    const updatedUserData = { ...req.body };
    const image = req.file;

    // Find the user by ID
    const user = await globalRedisService.findById(id.toString(), 'users');

    // Update user information using utility function
    const { isPasswordMatched, updatedUser } = await updateUserUtils(
      image,
      updatedUserData,
      user as UserDocument
    );

    if (isPasswordMatched) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: new Date(Date.now()),
      });

      // Delete the user from the request object
      delete req.user;
      await redisClient.del('currentUser');

      responseUtils.successResponse(
        res,
        StatusCodes.OK,
        'Since you have changed your password, you will be logged out'
      );
      return;
    }

    // Send success response indicating the user has been updated
    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      'Profile updated successfully',
      {
        updatedUser,
      }
    );
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/products/{id}:
 *   post:
 *     summary: Add a product to the cart
 *     description: Adds a specified product to the user's cart. Requires user authentication.
 *     tags:
 *       - Cart Operations
 *     operationId: addCartItem
 *     x-roles:
 *       - user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "67261bcdc4baf3f58d8f1d43"
 *         description: The unique identifier of the product to add to the cart.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK - Product successfully added to the cart.
 *       401:
 *         description: Unauthorized - User is not logged in.
 *       404:
 *         description: Not Found - The specified product ID does not exist.
 *       500:
 *         description: Internal Server Error - An unexpected error occurred.
 */

export const addCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUser = req.user as CurrentUser;

    if (!currentUser || !currentUser.userId) {
      throw new UnauthorizedError(
        'Authentication required to add items to cart'
      );
    }

    const productId: string = req.params.id;
    const { updatedProduct: product } = await addItem(currentUser, productId);
    const [products, users] = await Promise.all([
      getCacheKey('products'),
      getCacheKey('users'),
    ]);

    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      'Product added to cart',
      {
        product,
        currentUser,
        products,
        users,
      }
    );
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Remove a product from the cart
 *     description: Removes a specified product from the user's cart or decreases its quantity by 1. Requires authentication.
 *     tags:
 *       - Cart Operations
 *     operationId: removeCartItem
 *     x-roles:
 *       - user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "67260c7120390f8045c40f5b"
 *         description: The unique identifier of the product to remove from the cart.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK - Product successfully removed from the cart or quantity reduced by 1.
 *       400:
 *         description: Bad Request - Cart is empty or product does not exist in the cart.
 *       401:
 *         description: Unauthorized - User is not logged in.
 *       404:
 *         description: Not Found - The specified product ID does not exist.
 *       500:
 *         description: Internal Server Error - An unexpected error occurred.
 */

export const removeCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUser = req.user as CurrentUser;

    if (!currentUser || !currentUser.userId) {
      throw new UnauthorizedError(
        'Authentication required to remove items from cart'
      );
    }

    if (!currentUser.cart?.items.length) {
      throw new BadRequestError('Your cart is empty');
    }

    const { id } = req.params;
    const product = await globalRedisService.findById(id, 'products');

    const cart = currentUser.cart;
    const productExists = cart.items.find(
      (item) => item.productId.toString() === id
    );

    if (!productExists) {
      throw new BadRequestError(
        `Product with id ${id} does not exist in your cart`
      );
    }

    if (cart.items.length === 1 && productExists.quantity === 1) {
      cart.items = [];
      cart.totalPrice = 0;
      await updateProductStock(id, 1);
      await updateUserCart(currentUser);
      const [updatedUser, products, users] = await Promise.all([
        getCacheKey('currentUser'),
        getCacheKey('products'),
        getCacheKey('users'),
      ]);

      responseUtils.successResponse(
        res,
        StatusCodes.OK,
        'Product removed, your cart is now empty',
        {
          currentUser: updatedUser,
          products,
          users,
        }
      );
    } else if (productExists.quantity > 1) {
      cart.items = modifyCartItemQuantity(cart.items, id, -1);
      cart.totalPrice = calculateTotalPrice(cart.items);
      await updateProductStock(id, 1);
      await updateUserCart(currentUser);
      const [updatedUser, products, users] = await Promise.all([
        getCacheKey('currentUser'),
        getCacheKey('products'),
        getCacheKey('users'),
      ]);
      responseUtils.successResponse(
        res,
        StatusCodes.OK,
        'Quantity reduced by 1',
        {
          currentUser: updatedUser,
          products,
          users,
        }
      );
    } else {
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== id
      );
      cart.totalPrice = calculateTotalPrice(cart.items);
      await updateProductStock(id, 1);
      await updateUserCart(currentUser);
      const [updatedUser, products, users] = await Promise.all([
        getCacheKey('currentUser'),
        getCacheKey('products'),
        getCacheKey('users'),
      ]);
      responseUtils.successResponse(
        res,
        StatusCodes.OK,
        'Product removed from cart',
        {
          currentUser: updatedUser,
          products,
          users,
        }
      );
    }
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/products/cart:
 *   get:
 *     summary: Retrieve the user's cart
 *     description: Retrieves the contents of the user's cart. Requires authentication.
 *     tags:
 *       - Cart Operations
 *     operationId: getCart
 *     x-roles:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK - Cart successfully retrieved.
 *       401:
 *         description: Unauthorized - User is not logged in.
 *       404:
 *         description: Not Found - The user's cart is empty.
 *       500:
 *         description: Internal Server Error - An unexpected error occurred.
 */

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUser = req.user as CurrentUser;

    if (!currentUser || !currentUser.userId) {
      throw new UnauthorizedError('Authentication required to view cart');
    }

    if (!currentUser.cart?.items.length) {
      throw new NotFoundError('Your cart is empty');
    }

    responseUtils.successResponse(res, StatusCodes.OK, "Returned user's cart", {
      userCart: currentUser.cart,
    });
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/products/order:
 *   post:
 *     summary: Place an order
 *     description: Places an order with the items in the user's active cart. Requires authentication.
 *     tags:
 *       - Cart Operations
 *     operationId: placeOrder
 *     x-roles:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK - Order successfully placed.
 *       400:
 *         description: Bad Request - The cart is not active or empty.
 *       401:
 *         description: Unauthorized - User is not logged in.
 *       500:
 *         description: Internal Server Error - An unexpected error occurred.
 */

export const placeOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUser = req.user as CurrentUser;

    if (!currentUser || !currentUser.userId) {
      throw new UnauthorizedError('Authentication required to place an order');
    }

    if (!currentUser.cart || currentUser.cart.status !== 'active') {
      throw new BadRequestError('You do not have an active cart');
    }

    if (!currentUser.cart.items.length) {
      throw new BadRequestError('Your cart is empty');
    }

    // Create a new order
    const order: OrderDocument = await Order.create({
      user: currentUser.userId,
      userModel: 'User',
      orderItems: currentUser.cart.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice: currentUser.cart.totalPrice,
      userType: 'user',
    });

    if (!order) {
      throw new Error('Order not saved to database');
    }

    // Update orders cache
    const orders = await Order.find();
    await setCacheKey('orders', orders);

    // Clear the user's cart and update order history
    currentUser.cart = {
      user: currentUser.userId,
      items: [],
      totalPrice: 0,
      status: 'active',
      userType: 'user',
    };
    currentUser.orders = currentUser.orders || [];
    const orderId = new mongoose.Types.ObjectId(order._id as string);
    currentUser.orders.push(orderId.toString());

    // Update user in database and cache
    const [updatedUser] = await Promise.all([
      User.findByIdAndUpdate(
        currentUser.userId,
        { orders: currentUser.orders, cart: currentUser.cart },
        { new: true }
      ),
      User.find().then((users) => setCacheKey('users', users)),
    ]);

    if (!updatedUser) {
      throw new BadRequestError('User not updated in database');
    }

    const users = await User.find().select('-password');
    await setCacheKey('users', users);
    const products = await Product.find();

    await setCacheKey('products', products);
    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      'Your order has been placed successfully.',
      { order, users, currentUser, products }
    );
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};
