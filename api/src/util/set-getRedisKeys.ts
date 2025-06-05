import { BadRequestError } from '../errors/apiError';
import { redisClient } from './redisClient';

/**
 * Validate the cache key.
 *
 * @param key - The cache key to validate.
 * @returns True if the key is valid, false otherwise.
 */
const cacheKeys = ['users', 'orders', 'products', 'categories', 'currentUser'];
const isValidCacheKey = (key: string): boolean => {
  return cacheKeys!.includes(key);
};

/**
 * Retrieve a cached value by key.
 *
 * @param key - The cache key to retrieve.
 * @returns The parsed cached value or null if not found.
 * @throws BadRequestError if the key is invalid.
 */
export const getCacheKey = async (key: any): Promise<any | null> => {
  if (!isValidCacheKey(key)) throw new BadRequestError('Invalid cache key');

  const value = await redisClient.get(key);
  if (value !== null && value?.length !== 0) {
    // console.log(value.length);
    // for (let i = 0; i < value.length; i++) {
    //   console.log(value[0]);
    // }
    try {
      console.log('cache return');
      return JSON.parse(value);
    } catch (error) {
      console.error(`Failed to parse cache value for key ${key}:`, error);
      return null; // Return null if JSON parsing fails
    }
  } else {
    console.log(`Cache key ${key} not set yet`);
    return null;
  }
};

/**
 * Set a cache key with a specified expiration time.
 *
 * @param key - The cache key to set.
 * @param value - The value to cache.
 */
export const setCacheKey = async (
  key: any,
  value: Record<string, any> | Record<string, any>[]
): Promise<void> => {
  // if (!isValidCacheKey(key)) throw new BadRequestError('Invalid cache key');

  await redisClient.set(key, JSON.stringify(value));
};
