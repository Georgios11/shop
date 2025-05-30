import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';
import { BadRequestError } from '../errors/apiError';
import path from 'path';

const MAX_FILE_SIZE = 1024 * 2048; // 2MB file size limit

/**
 * Multer storage configuration for user images.
 */
const userStorage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ): void => {
    cb(null, 'public/images/users/');
  },

  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ): void => {
    cb(null, `${Date.now()}-${path.basename(file.originalname)}`);
  },
});

/**
 * Multer storage configuration for product images.
 */
const productStorage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ): void => {
    cb(null, 'public/images/products/');
  },

  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ): void => {
    cb(null, `${Date.now()}-${path.basename(file.originalname)}`);
  },
});

/**
 * File filter to allow only specific types of image files.
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeType && extname) {
    return cb(null, true);
  }
  cb(
    new BadRequestError(
      'Invalid file type. Only JPEG, PNG, and JPG files are allowed.'
    )
  );
};

/**
 * Multer configuration for uploading user images.
 */
export const uploadUser = multer({
  storage: userStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/**
 * Multer configuration for uploading product images.
 */
export const uploadProducts = multer({
  storage: productStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});
