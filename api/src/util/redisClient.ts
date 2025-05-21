import { createClient, RedisClientType } from 'redis';
import { getRedisUrl } from './secrets';
import logger from './logger';

const redisUrl = getRedisUrl();

// Log the Redis URL (with password masked) for debugging
const maskRedisUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.password) {
      urlObj.password = '****';
    }
    return urlObj.toString();
  } catch (e) {
    return 'invalid-url';
  }
};

logger.info(`Initializing Redis client at ${maskRedisUrl(redisUrl)}`);

export const redisClient: RedisClientType = createClient({
  url: redisUrl,
  socket: {
    tls: false, // Disable TLS since Redis Cloud works without it
    connectTimeout: 10000,
    reconnectStrategy: (retries) => {
      if (retries > 4) {
        logger.error('Redis max retries reached. Giving up...');
        return new Error('Redis max retries reached');
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on('connect', () => {
  logger.info('Redis client connected successfully');
});

redisClient.on('error', (err: Error) => {
  logger.error('Redis client error:', err);
});

export const connectRedis = async (): Promise<void> => {
  try {
    logger.info('Attempting to connect to Redis...');
    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};
