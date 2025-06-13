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

// Get the environment
export const ENVIRONMENT = process.env.NODE_ENV || 'development';
const prod = ENVIRONMENT === 'production';

// Get the client URL based on environment
export const getClientUrl = (): string => {
  if (prod) {
    // In production, use the Netlify URL
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      logger.error(
        'FRONTEND_URL environment variable is not set in production'
      );
      // Fallback to hardcoded Netlify URL if env var is missing
      return 'https://gleeful-faun-812bcc.netlify.app';
    }
    return frontendUrl;
  }

  // In development, use localhost
  const clientUrl = process.env.CLIENT_URL;
  if (!clientUrl) {
    logger.error('CLIENT_URL environment variable is not set in development');
    // Fallback to hardcoded localhost URL if env var is missing
    return 'http://localhost:5174';
  }
  return clientUrl;
};

// Export the client URL with validation
export const clientUrl = (() => {
  const url = getClientUrl();
  logger.info(`Using client URL: ${url} (${ENVIRONMENT} environment)`);
  return url;
})();

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
export const redisUrlLocal = process.env['REDIS_URL_LOCAL'] as string;
export const redisUrlCloud = process.env['REDIS_CLOUD_URL'] as string;
export const API_URL = process.env['API_URL'] as string;
export const FRONTEND_URL = process.env['FRONTEND_URL'] as string;

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

export const getDomain = () => {
  if (ENVIRONMENT === 'production') {
    // For production (Railway), extract domain from API_URL
    // e.g., from "https://your-app.up.railway.app" to "your-app.up.railway.app"
    return API_URL.replace(/^https?:\/\//, '');
  }
  return 'localhost'; // For development
};
