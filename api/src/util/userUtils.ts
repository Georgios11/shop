import { NotFoundError, UnauthenticatedError } from '../errors/apiError';
import User, { UserDocument } from '../models/User';
import { comparePassword } from './passwordUtils';
import { UnauthorizedError } from '../errors/apiError';
import { getCacheKey } from './set-getRedisKeys';
import { updateCachePost } from './updateCache';

/**
 * Validates user credentials.
 *
 * This asynchronous function checks if the user with the given email exists, verifies the password,
 * and checks if the user's account is banned. If the credentials are invalid or the account is banned,
 * it throws an appropriate error. If the credentials are valid, it returns the user object.
 *
 * @async
 * @function validateUser
 * @param {string} email - The email of the user to be validated.
 * @param {string} password - The password of the user to be validated.
 * @throws {UnauthenticatedError} If the email or password is invalid.
 * @throws {UnauthorizedError} If the user's account is banned.
 * @returns {Promise<Object>} - A promise that resolves to the user object if the credentials are valid.
 */
export const validateUser = async (email: string, password: string) => {
  const users: any = await getCacheKey('users');

  let user: any = users?.find((user: any) => user.email === email);

  // If user not found in cache or user is missing password, get from database
  if (!user || !user.password) {
    user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('Account not found, please register');
    }
    console.log('login db');

    await updateCachePost('users', User, user);
  }

  // Check if user is banned
  if (user.is_banned) {
    throw new UnauthorizedError(
      'Your account has been suspended. Please contact an administrator'
    );
  }
  const isValidPassword = await comparePassword(password, user.password);

  // If password is invalid, throw an error
  if (!isValidPassword) {
    throw new UnauthenticatedError('Invalid credentials');
  }
  if (user) console.log('login cache');

  return user;
};
