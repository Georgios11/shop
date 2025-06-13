import { NextFunction, Request, Response } from 'express';
import { FilterQuery, ObjectId } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs/promises';
import cloudinary from 'cloudinary';

import responseUtils from '../util/responseUtils';
import { validateUser } from '../util/userUtils';
import { createJWT, verifyJWT } from '../util/tokenUtils';
import { encryptPassword } from '../util/passwordUtils';
import { clientUrl, getDomain } from '../util/secrets';
import sendEmailWithNodeMailer from '../util/email';
import { BadRequestError, NotFoundError } from '../errors/apiError';
import User, { UserDocument } from '../models/User';
import Category from '../models/Category';
import globalRedisService from '../services/globalRedis.service';
import { getCacheKey, setCacheKey } from '../util/set-getRedisKeys';

function createKeywordFilter<T>(req: Request): FilterQuery<T> {
  return req.query.keyword
    ? { brand: { $regex: req.query.keyword as string, $options: 'i' } }
    : {};
}

/**
 * @openapi
 * /api/v1/open/products:
 *   get:
 *     summary: Retrieve all products
 *     description: Retrieve a paginated list of all products with optional keyword filtering.
 *     tags:
 *       - Products
 *     operationId: getAllProducts
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
 *         description: Keyword to filter products by name or description.
 *     responses:
 *       200:
 *         description: Successfully retrieved products.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Returned products 1-10 of 100"
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
 *                             example: "Product Name"
 *                           description:
 *                             type: string
 *                             example: "Product description goes here."
 *                           price:
 *                             type: number
 *                             example: 19.99
 *                     pageNumber:
 *                       type: integer
 *                       example: 1
 *                     pages:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Bad Request - Invalid pagination parameters or query.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid page number"
 *       404:
 *         description: Not Found - No products were found with the provided filters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No products found"
 *       500:
 *         description: Internal Server Error - An unexpected error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred on the server"
 */

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await getCacheKey('products');
    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      'Returned all products',
      { products }
    );
  } catch (error: unknown) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/open/products/{id}:
 *   get:
 *     summary: Retrieve a single product by ID
 *     description: Fetches a product's details by its unique ID. Useful for displaying detailed information on a product page or for inventory checks.
 *     tags:
 *       - Products
 *     operationId: getSingleProduct
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "605c72f2f1e4b8b1d6d9c1a2" # Example ID
 *         description: The unique identifier of the product to retrieve.
 *     responses:
 *       200:
 *         description: OK - Product details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Returned product with id 605c72f2f1e4b8b1d6d9c1a2"
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "605c72f2f1e4b8b1d6d9c1a2"
 *                         name:
 *                           type: string
 *                           example: "Sample Product"
 *                         description:
 *                           type: string
 *                           example: "A detailed description of the sample product."
 *                         price:
 *                           type: number
 *                           example: 29.99
 *                         stock:
 *                           type: integer
 *                           example: 100
 *       400:
 *         description: Invalid Request - The provided product ID is not valid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Request"
 *                 message:
 *                   type: string
 *                   example: "The product ID provided is not in a valid format."
 *       404:
 *         description: Resource Not Found - No product exists with the specified ID.
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
 *                   example: "An unexpected error occurred on the server"
 */

export const getSingleProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.params.id;
    const product = await globalRedisService.findById(
      productId.toString(),
      'products'
    );

    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      `Returned product with id ${productId}`,
      { product }
    );
  } catch (error: unknown) {
    responseUtils.errorResponse(error, next);
  }
};
/**
 * @openapi
 * /api/v1/open/categories:
 *   get:
 *     summary: Retrieve all categories
 *     description: Fetches a list of all available categories. Useful for displaying category options in a dropdown or category listing page.
 *     tags:
 *       - Categories
 *     operationId: getAllCategories
 *     responses:
 *       200:
 *         description: OK - Successfully retrieved all categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Returned all categories"
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "605c72f2f1e4b8b1d6d9c1a2"
 *                           name:
 *                             type: string
 *                             example: "Electronics"
 *                           description:
 *                             type: string
 *                             example: "All kinds of electronic devices and accessories"
 *       400:
 *         description: Invalid Request - The request parameters are incorrect.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Request"
 *                 message:
 *                   type: string
 *                   example: "The request parameters are not valid."
 *       404:
 *         description: Resource Not Found - No categories were found.
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
 *                   example: "No categories found."
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

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await globalRedisService.findAll(Category, 'categories');

    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      'Returned all categories',
      { categories }
    );
  } catch (error: unknown) {
    responseUtils.errorResponse(error, next);
  }
};
/**
 * @openapi
 * /api/v1/open/categories/{id}:
 *   get:
 *     summary: Retrieve a category by ID
 *     description: Fetches the details of a specific category by its unique ID. Useful for displaying category details on a product page or managing category information.
 *     tags:
 *       - Categories
 *     operationId: getSingleCategory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "605c72f2f1e4b8b1d6d9c1a2" # Example ID
 *         description: The unique identifier of the category to retrieve.
 *     responses:
 *       200:
 *         description: OK - Category details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Returned category with id 605c72f2f1e4b8b1d6d9c1a2"
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "605c72f2f1e4b8b1d6d9c1a2"
 *                         name:
 *                           type: string
 *                           example: "Electronics"
 *                         description:
 *                           type: string
 *                           example: "All kinds of electronic devices and accessories."
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
 *       400:
 *         description: Invalid Request - The provided category ID is not valid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Request"
 *                 message:
 *                   type: string
 *                   example: "The category ID provided is not in a valid format."
 *       404:
 *         description: Resource Not Found - No category was found with the specified ID.
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
 *                   example: "Category not found."
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

export const getSingleCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categoryId = req.params.id;
    const category = await globalRedisService.findById(
      categoryId.toString(),
      'categories'
    );

    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      `Returned category with id ${categoryId}`,
      { category }
    );
  } catch (error: unknown) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @swagger
 * /api/v1/open/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Register]
 *     description: Creates a new user account and sends an account activation email. **Important:** Please seed the database before testing this endpoint to ensure it works correctly.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               confirmPassword:
 *                 type: string
 *                 example: Password123!
 *               phone:
 *                 type: string
 *                 example: 1234567890
 *               role:
 *                 type: string
 *                 example: user
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *               - phone
 *               - role
 *     responses:
 *       201:
 *         description: User registered successfully and activation email sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An email has been sent to john@example.com. Please verify your email account.
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad Request - Validation errors or missing fields.
 *       500:
 *         description: Server error - Unable to register user.
 */

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Handle image upload if provided
    const image = req?.file;

    if (image) {
      try {
        // Upload user image to cloudinary
        const timestamp = new Date().getTime();
        const newPublicId = `users/${timestamp}_${image.originalname.replace(
          /\.[^/.]+$/,
          ''
        )}`;

        const response = await cloudinary.v2.uploader.upload(image.path, {
          width: 300,
          crop: 'scale',
          public_id: newPublicId,
        });

        // Delete image from local machine before saving updates to database
        await fs.unlink(image.path);
        req.body.image = response.secure_url;
        req.body.imagePublicId = response.public_id;
      } catch (uploadError) {
        // Clean up the local file if it exists
        try {
          await fs.unlink(image.path);
        } catch (unlinkError) {
          // Ignore unlink errors as the file might already be deleted
        }
        throw new Error(
          `Failed to process image: ${
            uploadError instanceof Error ? uploadError.message : 'Unknown error'
          }`
        );
      }
    }

    // Remove confirmPassword from the request body
    delete req.body.confirmPassword;

    // Encrypt the user's password
    req.body.password = await encryptPassword(req.body.password);

    // Generate a JWT token with the user's details
    const token = createJWT(req.body);

    // Prepare email data for account activation
    const email = req.body.email;
    const emailData = {
      email,
      subject: 'Account Activation Email',
      html: `
            <h2>Hello ${req.body.name}</h2>
            <p>Please click here to <a href="${clientUrl}/activate/${token}" target="_blank">activate your account</a></p>
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <p>${clientUrl}/activate/${token}</p>
        `,
    };

    // Send activation email
    sendEmailWithNodeMailer(emailData);

    // Send success response with a message and the generated token
    responseUtils.successResponse(
      res,
      StatusCodes.CREATED,
      `An email has been sent to ${req.body.email}. Please verify your email account`,
      { token }
    );
  } catch (error: unknown) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/open/verify-email:
 *   post:
 *     summary: Verify email for account activation
 *     description: Verifies the user's email using a token sent during registration and activates their account.
 *     tags:
 *       - Email Verification
 *     operationId: verifyEmail
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The JWT verification token sent to the user's email.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             required:
 *               - token
 *     responses:
 *       201:
 *         description: Created - Account successfully activated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account created, please log in"
 *                 data:
 *                   type: object
 *                   properties:
 *                     newUser:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "605c72f2f1e4b8b1d6d9c1a2"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "johndoe@example.com"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-03-21T10:23:45.123Z"
 *       400:
 *         description: Invalid Request - Missing or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Request"
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing verification token."
 *       401:
 *         description: Unauthorized - Token is invalid or expired.
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
 *                   example: "The verification token is invalid or has expired."
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

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract the token from the request body
    const { token } = req.body;

    // Verify and decode the JWT token
    const decoded = verifyJWT(token);

    // Create a new user using the decoded token information
    const newUser = await User.create(decoded);

    // Throw an error if the new user account is not created
    if (!newUser) throw new BadRequestError('Account not created');

    //set cache to include new user
    const users = await getCacheKey('users');
    users.unshift(newUser);
    await setCacheKey('users', users);
    // Send success response with the new user details
    const sanitizedUsers = users.map((user: UserDocument) => {
      const userObj = { ...user, password: undefined };
      return userObj;
    });
    responseUtils.successResponse(
      res,
      StatusCodes.CREATED,
      'Account created, please log in',
      {
        users: sanitizedUsers,
      }
    );
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/open/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user with their email and password, issues a JWT token, and stores it in a secure HTTP-only cookie.
 *     tags:
 *       - Log in
 *     operationId: loginUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@email.com"
 *               password:
 *                 type: string
 *                 example: "121212"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: OK - User successfully logged in.
 *         headers:
 *           Set-Cookie:
 *             description: Contains the JWT token as an HTTP-only cookie.
 *             schema:
 *               type: string
 *               example: "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; Secure; SameSite=None"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You have logged in"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "605c72f2f1e4b8b1d6d9c1a2"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "johndoe@example.com"
 *                         role:
 *                           type: string
 *                           example: "user"
 *       400:
 *         description: Invalid Request - Missing or incorrect login credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Request"
 *                 message:
 *                   type: string
 *                   example: "Email or password is incorrect."
 *       401:
 *         description: Unauthorized - Invalid email or password.
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
 *                   example: "Authentication failed."
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

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is already logged in, then logout
    if (req.headers.cookie) {
      const cookieName = req.headers.cookie.split('=')[0].trim();
      res.clearCookie(cookieName, { path: '/' });
    }

    const { email, password } = req.body;

    const user = await validateUser(email, password);
    delete user.password;
    await setCacheKey('currentUser', user);

    // await setCacheKey('currentUser', { userId: user._id, role: user.role });
    const token = createJWT({ userId: user._id, role: user.role });

    // Set token expiration to 14 minutes
    const expiresIn = 1000 * 60 * 14;

    // Set the JWT token as an HTTP-only cookie
    res.cookie('token', token, {
      path: '/',
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: getDomain(), // Use the dynamic domain
    });
    // Log the cookie that will be sent in response

    responseUtils.successResponse(res, StatusCodes.OK, 'You have logged in', {
      user,
    });
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/open/forget-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset email to the user's email address if it is registered. The email includes a link with a JWT token for resetting the password.
 *     tags:
 *       - User - No logged in privileges
 *     operationId: forgetPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: OK - Password reset email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An email has been sent to johndoe@example.com. Please reset your password."
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       404:
 *         description: Not Found - No account associated with the provided email.
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
 *                   example: "Account not found"
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

export const forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract email from the request body
    const email = req.body.email;

    // Find user by email
    const users = await getCacheKey('users');
    const user = users.find((user: UserDocument) => user.email === email);

    // Throw an error if no user is found
    if (!user) throw new NotFoundError(`Account not found`);

    // Create a JWT token with the user's email
    const token = createJWT({ email });

    // Prepare email data for password reset
    const emailData = {
      email,
      subject: 'Reset Password',
      html: `
            <h2>Hello ${user.name}</h2>
            <p>Please click here to <a href="${clientUrl}/reset-password/${token}" target="_blank">reset your password</a></p>
        `,
    };

    sendEmailWithNodeMailer(emailData);

    // Send success response with a message and the generated token
    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      `An email has been sent to ${email}. Please reset your password`,
      { token }
    );
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};

/**
 * @openapi
 * /api/v1/open/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Allows users to reset their password using a valid JWT token sent to their email and a new password.
 *     tags:
 *       - User - No logged in privileges
 *     operationId: resetPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The JWT token received in the password reset email.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               newPassword:
 *                 type: string
 *                 description: The new password to set for the user.
 *                 example: "newSecurePassword123"
 *             required:
 *               - token
 *               - newPassword
 *     responses:
 *       200:
 *         description: OK - Password reset successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password updated. Please log in"
 *       400:
 *         description: Invalid Request - Missing or invalid token or password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Request"
 *                 message:
 *                   type: string
 *                   example: "Invalid token payload"
 *       401:
 *         description: Unauthorized - The token is invalid or has expired.
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
 *                   example: "The token is invalid or has expired."
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

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token and newPassword from the request body
    const { token, newPassword } = req.body;

    // Verify and decode the JWT token to get the user's email
    const payload = verifyJWT(token);

    let email: string | undefined;

    // Check if the payload is of type JwtPayload and contains the email
    if (typeof payload !== 'string' && 'email' in payload) {
      email = payload.email as string;
    } else {
      throw new Error('Invalid token payload');
    }

    if (email) {
    } else {
      throw new Error('Email not found in the token payload');
    }

    // Encrypt the new password
    const hashedPassword = await encryptPassword(newPassword);

    // Update the user's password in the database
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true, runValidators: true }
    );
    // Throw an error if the password update fails
    if (!updatedUser) throw new BadRequestError('Password update failed');

    const users = (await getCacheKey('users')) as UserDocument[];
    const updatedUsers: UserDocument[] = users.map((user: UserDocument) =>
      user._id === (updatedUser._id as unknown as ObjectId).toString()
        ? updatedUser
        : user
    );
    await setCacheKey('users', updatedUsers);
    // Send success response indicating the password has been updated
    responseUtils.successResponse(
      res,
      StatusCodes.OK,
      'Password updated. Please log in'
    );
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};
