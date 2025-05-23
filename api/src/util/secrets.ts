import dotenv from 'dotenv';
import fs from 'fs';

import logger from './logger';

if (fs.existsSync('.env')) {
  logger.debug('Using .env file to supply config environment variables');
  dotenv.config({ path: '.env' });
} else {
  logger.debug(
    'Using .env.example file to supply config environment variables'
  );
}

export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === 'production'; // Anything else is treated as 'dev'
export const PORT = process.env.PORT;
export const JWT_KEY = process.env['JWT_KEY'] as string;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as string;
export const REFRESH_JWT_EXPIRES_IN = process.env
  .REFRESH_JWT_EXPIRES_IN as string;
export const SMTP_USERNAME = process.env['SMTP_USERNAME'] as string;
export const SMTP_PASSWORD = process.env['SMTP_PASSWORD'] as string;
export const MONGODB_URI = process.env['MONGODB_URI'] as string;
export const CLOUDINARY_URL = process.env['CLOUDINARY_URL'] as string;
export const smtpUsername = process.env['SMTP_USERNAME'] as string;
export const smtpPassword = process.env['SMTP_PASSWORD'] as string;
export const clientUrl = process.env['CLIENT_URL'] as string;
export const redisUrlLocal = process.env['REDIS_URL_LOCAL'] as string;
export const redisUrlCloud = process.env['REDIS_CLOUD_URL'] as string;

if (!JWT_KEY) {
  logger.error('No client secret. Set JWT_SECRET environment variable.');
  process.exit(1);
}

if (!MONGODB_URI) {
  if (prod) {
    logger.error(
      'No mongo connection string. Set MONGODB_URI environment variable.'
    );
  } else {
    logger.error(
      'No mongo connection string. Set MONGODB_URI_LOCAL environment variable.'
    );
  }
  process.exit(1);
}

export const getRedisUrl = (): string => {
  if (prod) {
    if (!redisUrlCloud) {
      logger.error(
        'No Redis Cloud URL. Set REDIS_CLOUD_URL environment variable.'
      );
      process.exit(1);
    }
    return redisUrlCloud;
  }

  if (!redisUrlLocal) {
    logger.warn('No local Redis URL. Using default: redis://localhost:6379');
    return 'redis://localhost:6379';
  }

  return redisUrlLocal;
};
