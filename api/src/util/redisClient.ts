import { createClient, RedisClientType } from 'redis';

export const redisClient: RedisClientType = createClient({
  url: 'redis://localhost:6379',
});
// Set up event listeners before connecting
redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (err: Error) => {
  console.error('Redis client error', err);
});
export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect(); // Connect the client here after setting up listeners
  } catch (error) {
    console.log('Failed to connect to Redis:', error);
  }
};
