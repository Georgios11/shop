import { promises as fs } from 'fs';

import { comparePassword, encryptPassword } from './passwordUtils';
import {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} from '../errors/apiError';
import User, { UserDocument } from '../models/User';
import cloudinary from './cloudinary';
import { setCacheKey } from './set-getRedisKeys';
import { UpdateUserData, UpdateUserResult } from '../types/user';

/**
 * Updates user information, including uploading a new image to Cloudinary and updating the password if provided.
 *
 * @async
 * @function updateUserUtils
 * @param {Express.Multer.File | undefined} image - The uploaded image file, or undefined if no image is provided.
 * @param {UpdateUserData} userData - An object containing user data to be updated, including optional password fields.
 * @param {UserDocument} user - The current user document instance to be updated.
 *
 * @returns {Promise<UpdateUserResult>} - Returns an object containing the password match status and updated user document.
 *
 * @throws {UnauthenticatedError} - Throws if the old password provided does not match the current user password.
 * @throws {BadRequestError} - Throws if the new password and confirmation password do not match.
 */
async function updateUserUtils(
  image: Express.Multer.File | undefined,
  userData: UpdateUserData,
  user: UserDocument
): Promise<UpdateUserResult> {
  try {
    let isPasswordMatched: boolean | undefined;

    // Get the current user before any updates
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const oldImagePublicId = user.imagePublicId;

    if (image) {
      // Delete old image from Cloudinary if it exists
      if (oldImagePublicId) {
        try {
          await cloudinary.uploader.destroy(oldImagePublicId);
        } catch (deleteError) {
          console.error(
            'Error deleting old image from Cloudinary:',
            deleteError
          );
        }
      }

      try {
        // Upload new user image to Cloudinary with timestamp to force uniqueness
        const timestamp = new Date().getTime();
        const newPublicId = `users/${timestamp}_${image.originalname.replace(
          /\.[^/.]+$/,
          ''
        )}`;

        const uploadResponse = await cloudinary.uploader.upload(image.path, {
          width: 300,
          crop: 'scale',
          unique_filename: true,
          overwrite: false,
          public_id: newPublicId,
        });

        // Delete the image from the local machine
        await fs.unlink(image.path);

        // Update user data with new image info
        userData.image = uploadResponse.secure_url;
        userData.imagePublicId = uploadResponse.public_id;
      } catch (uploadError) {
        // Clean up the local file if it exists, regardless of where the error occurred
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

    // Handle password update if provided
    const { oldPassword, newPassword, confirmNewPassword } = userData;
    if (oldPassword && newPassword) {
      isPasswordMatched = await comparePassword(oldPassword, user.password);

      if (!isPasswordMatched) {
        throw new UnauthenticatedError('Incorrect old password');
      }

      if (newPassword === oldPassword) {
        throw new BadRequestError(
          'New password cannot be the same as old password'
        );
      }

      if (newPassword !== confirmNewPassword) {
        throw new BadRequestError('Please confirm new password');
      }

      const hashedPassword = await encryptPassword(newPassword);
      userData.password = hashedPassword;

      delete userData.oldPassword;
      delete userData.newPassword;
      delete userData.confirmNewPassword;
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(user._id, userData, {
      new: true,
    }).select('-password');

    if (!updatedUser) {
      throw new NotFoundError('User not updated');
    }

    // Update cache
    const users = await User.find();
    await setCacheKey('users', users);
    if (updatedUser) {
      await setCacheKey('currentUser', updatedUser);
    }

    return { isPasswordMatched, updatedUser };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error; // Pass the error to be handled by the calling function
  }
}

export default updateUserUtils;
