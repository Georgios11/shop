import { Request, Response, NextFunction } from 'express';
import mongoose, { Error } from 'mongoose';
import {
  body,
  validationResult,
  param,
  CustomValidator,
} from 'express-validator';
import { BadRequestError, NotFoundError } from '../errors/apiError';
import User from '../models/User';

/**
 * Middleware function to handle validation errors.
 *
 * This higher-order function returns an array of middleware functions. It first runs the provided validation functions,
 * and then checks for validation errors in the request. If any validation errors are found, it throws appropriate errors
 * based on the type of validation error.
 *
 * @function withValidationErrors
 * @param {Function[]} validateValues - An array of validation functions from express-validator.
 * @returns {Array<Function>} An array of middleware functions.
 */
type ValidateFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

const withValidationErrors = (
  validateValues: ValidateFunction[]
): ValidateFunction[] => {
  return [
    ...validateValues,
    (req: Request, res: Response, next: NextFunction): void => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);

        if (
          errorMessages[0].startsWith('No user') ||
          errorMessages[0].startsWith('No product') ||
          errorMessages[0].startsWith('No category') ||
          errorMessages[0].startsWith('Account not found')
        ) {
          throw new NotFoundError(errorMessages[0]);
        }

        throw new BadRequestError(errorMessages[0]);
      }

      next();
    },
  ];
};

/**
 * Middleware function to validate user registration input.
 *
 * This middleware function validates the registration input fields: name, email, password, and phone.
 * It ensures that the name is between 3-30 characters, the email is in a valid format and not already in use,
 * the password is between 6-15 characters, and the phone number is a valid number between 10-15 digits.
 *
 * @const {Array<Function>} validateRegistrationInput - An array of middleware functions for validation.
 */

export const validateRegistrationInput = withValidationErrors([
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .toLowerCase()
    .isLength({ min: 3, max: 30 })
    .withMessage('Name must be between 3-30 characters'),
  body('role')
    .optional()
    .trim()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin')
    .default('user'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Invalid email format')
    .custom(async (email: string) => {
      const userExists = await User.findOne({ email });

      if (userExists) {
        throw new Error('Email is already in use, please log in');
      }

      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .trim()
    .isLength({ min: 6, max: 15 })
    .withMessage('Password must be between 6-15 characters long'),
  body('confirmPassword')
    .notEmpty()
    .trim()
    .withMessage('Please confirm your password')
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new BadRequestError('Password not confirmed');
      }
      return true;
    }),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .custom((value: string) => {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Invalid phone number');
      }
      return true;
    })
    .withMessage('Invalid phone number'),
]);

/**
 * Middleware to validate the input for updating user details.
 * All fields are optional, but if provided, they must meet the validation criteria:
 * - oldPassword is required only when newPassword is provided
 * - newPassword must be 6-15 characters if provided
 * - image file must be under 2MB if provided
 * - phone must match the regex pattern if provided
 *
 * @function validateUpdateUserInput
 * @returns {Array} Array of validation middlewares to check user input.
 */
export const validateUpdateUserInput = withValidationErrors([
  body('oldPassword')
    .if(body('newPassword').exists({ checkFalsy: true }))
    .notEmpty()
    .withMessage('Old password is required when setting new password'),
  body('newPassword')
    .if(body('newPassword').exists({ checkFalsy: true }))
    .trim()
    .isLength({ min: 6, max: 15 })
    .withMessage('New password must be between 6-15 chars long'),
  body('image').custom((value, { req }) => {
    if (!req.file) return true; // Skip if no file
    if (req.file.size > 2000000) {
      throw new BadRequestError('Image file is larger than 2 MB');
    }
    return true;
  }),
  body('phone')
    .if(body('phone').exists({ checkFalsy: true }))
    .trim()
    .custom((value) => {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Invalid phone number');
      }
      return true;
    })
    .withMessage('Invalid phone number'),
]);

/**
 * Middleware to validate the `id` parameter in the request.
 *
 * - Ensures the `id` is a valid MongoDB ObjectId.
 *
 * @function validateIdParam
 * @returns {Array} Array of validation middlewares to check the `id` parameter.
 */
export const validateIdParam = withValidationErrors([
  /**
   * Custom validation for `id` param to check if it is a valid MongoDB ObjectId.
   *
   * @param {string} id - The ID passed in the request parameters.
   * @throws {Error} If the `id` is not a valid MongoDB ObjectId.
   * @returns {Promise<void>} Resolves if the `id` is valid, otherwise throws an error.
   */
  param('id').custom(async (id: string) => {
    const isValidId = mongoose.Types.ObjectId.isValid(id);

    if (!isValidId) {
      throw new Error('Invalid MongoDB id');
    }
  }),
]);

/**
 * Middleware to validate login input fields.
 *
 * - Ensures the `email` field is not empty and is a valid email.
 * - Ensures the `password` field is not empty.
 *
 * @function validateLoginInput
 * @returns {Array} Array of validation middlewares to check login input.
 */
export const validateLoginInput = withValidationErrors([
  /**
   * Validate that `email` is provided, not empty, and in a valid format.
   */
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .toLowerCase(),
  body('password').trim().notEmpty().withMessage('Password is required'),
]);

/**
 * Validator for resetting the password.
 * Ensures that:
 *  - The new password is not empty and meets the minimum length requirement.
 *  - The confirmation password matches the new password.
 *
 * @returns {Array} - Array of validation rules to be used in a route.
 */
export const validateResetPassword = withValidationErrors([
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Minimum password length is 6 characters'),

  body('confirmNewPassword')
    .trim()
    .notEmpty()
    .withMessage('Please confirm new password')
    .custom(((confirmNewPassword, { req }) => {
      if (confirmNewPassword !== (req as Request).body.newPassword) {
        throw new BadRequestError('New password not confirmed');
      }
      return true;
    }) as CustomValidator),
]);

/**
 * Middleware function to validate category input.
 *
 * This middleware function validates the category input field: name.
 * It ensures that the category name is not empty, is trimmed, converted to lowercase,
 * and has a minimum length of 4 characters.
 *
 * @const {Array<Function>} validateCategory - An array of middleware functions for validation.
 */

export const validateCategory = withValidationErrors([
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .toLowerCase()
    .isLength({ min: 4 })
    .withMessage('Minimum category name length is 4 characters'),
]);

/**
 * Validator for checking the "slug" route parameter.
 * Ensures that:
 *  - The slug parameter exists and is not empty.
 *  - The slug is a string.
 *
 * @returns {Array} - Array of validation rules to be used in a route.
 */
export const validateSlugParam = withValidationErrors([
  param('slug')
    .exists()
    .withMessage('Slug parameter is missing')
    .trim()
    .notEmpty()
    .withMessage('Slug parameter cannot be empty')
    .isString()
    .withMessage('Slug must be a string'),
]);

/**
 * Middleware function to validate product input fields.
 *
 * This middleware function validates the product input fields: name, description, brand, price, and image.
 * It ensures that each field meets specific criteria, such as being present, not empty, being of a certain type,
 * and having a minimum length or value.
 *
 * @const {Array<Function>} validateProductInput - An array of middleware functions for validation.
 */

export const validateProductInput = withValidationErrors([
  body('name')
    .exists()
    .withMessage('Name is required')
    .notEmpty()
    .withMessage('Name must not be empty')
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .toLowerCase()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),

  body('category')
    .exists()
    .withMessage('Product category is required')
    .notEmpty()
    .withMessage('Product category must not be empty')
    .isString()
    .withMessage('Product category must be a string')
    .trim()
    .toLowerCase()
    .isLength({ min: 3 })
    .withMessage('Product category must be at least 3 characters long'),

  body('description')
    .exists()
    .withMessage('Description is required')
    .notEmpty()
    .withMessage('Description must not be empty')
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 200 })
    .withMessage('Description must be at least 200 characters long'),

  body('brand')
    .exists()
    .withMessage('Brand is required')
    .notEmpty()
    .withMessage('Brand must not be empty')
    .isString()
    .withMessage('Brand must be a string')
    .trim()
    .toLowerCase()
    .isLength({ min: 2 })
    .withMessage('Brand must be at least 2 characters long'),

  body('price')
    .exists()
    .withMessage('Price is required')
    .notEmpty()
    .withMessage('Price must not be empty')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a number greater than 0'),

  body('image').custom((value, { req }) => {
    /**
     * Custom validation for the image file.
     * Ensures that the image file exists, and its size is under the limit.
     *
     * @param {any} value - The value passed (can be ignored for this custom check).
     * @param {Object} meta - Metadata object containing the request.
     * @param {Request} meta.req - The request object containing the uploaded file.
     * @throws {BadRequestError} If the image is missing or exceeds the size limit.
     * @returns {boolean} - Returns true if the image is valid.
     */
    const file = req.file;
    if (!file) {
      throw new BadRequestError('Image file is required');
    }
    if (file.size > 2000000) {
      throw new BadRequestError('Image file is larger than 2MB');
    }
    return true;
  }),
]);
