import bcrypt from 'bcryptjs';

const saltRounds = 10;

/**
 * Encrypts a plain text password using bcrypt.
 *
 * @param {string} plainPassword - The plain text password to encrypt.
 * @returns {Promise<string>} - A promise that resolves to the hashed password.
 */
export const encryptPassword = async (
  plainPassword: string
): Promise<string> => {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('An unknown error occurred during password encryption.');
    }
  }
};

/**
 * Compares a plain text password with a hashed password.
 *
 * @param {string} plainPassword - The plain text password to compare.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the passwords match.
 */
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('An unknown error occurred during password comparison.');
    }
  }
};
