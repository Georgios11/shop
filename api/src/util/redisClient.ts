import { createClient, RedisClientType } from 'redis';
import { getRedisUrl } from './secrets';
import logger from './logger';

export const redisClient: RedisClientType = createClient({
  url: getRedisUrl(),
  socket: {
    tls: process.env.NODE_ENV === 'production',
    rejectUnauthorized: false,
    connectTimeout: 10000,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis max retries reached. Giving up...');
        return new Error('Redis max retries reached');
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

// Set up event listeners before connecting
redisClient.on('connect', () => {
  logger.info(`Redis client connected in ${process.env.NODE_ENV} mode`);
});

redisClient.on('error', (err: Error) => {
  logger.error('Redis client error:', err);
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect(); // Connect the client here after setting up listeners
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};
