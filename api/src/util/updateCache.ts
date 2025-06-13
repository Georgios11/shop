import { Document, Model } from 'mongoose';

import { getCacheKey, setCacheKey } from './set-getRedisKeys';
import { CacheDocument } from '../types';

/**
 * Utility function to update the cache for a given model. ONLY FOR POST METHOD
 *
 * @async
 * @function updateCachePost
 * @param modelName - The name of the model (users, products, categories, orders).
 * @param model - The mongoose model to use.
 * @param newData - The new data to be added to the cache.
 * @throws {Error} - If the model does not exist.
 */
const models = ['users', 'products', 'categories', 'orders'];
export const updateCachePost = async (
  modelName: string,
  model: Model<any>,
  newData: CacheDocument
): Promise<void> => {
  if (!models.includes(modelName)) {
    throw new Error(`Model ${modelName} does not exist in the database.`);
  }
  const cacheKey = modelName;

  const cached = await getCacheKey(cacheKey);

  if (cached) {
    const data = Array.isArray(cached) ? cached : [cached];
    data.push(newData);
    await setCacheKey(cacheKey, data);
  } else {
    const allData = await model.find();
    allData.push(newData);
    await setCacheKey(cacheKey, allData);
  }
};

/**
 * Utility function to update an item in the cache for a given model. ONLY FOR PUT METHOD
 *
 * @async
 * @function updateCachePut
 * @param modelName - The name of the model (users, products, categories, orders).
 * @param model - The mongoose model to use.
 * @param newData - The updated data.
 * @throws {Error} - If the model does not exist.
 */
export const updateCachePut = async (
  modelName: string,
  model: Model<any>,
  newData: CacheDocument
): Promise<void> => {
  if (!models.includes(modelName)) {
    throw new Error(`Model ${modelName} does not exist in the database.`);
  }

  const cacheKey = modelName;
  const cached = await getCacheKey(cacheKey);

  if (cached) {
    const data = Array.isArray(cached) ? cached : [cached];
    const updatedData = data.map((doc: CacheDocument) =>
      doc._id === newData._id ? newData : doc
    );
    await setCacheKey(cacheKey, updatedData);
  } else {
    const allData = await model.find();
    const updatedData = allData.map((doc: CacheDocument) =>
      doc._id === newData._id ? newData : doc
    );
    await setCacheKey(cacheKey, updatedData);
  }
};

/**
 * Utility function to remove an item from the cache for a given model. DELETE METHOD
 *
 * @async
 * @function updateCacheDelete
 * @param modelName - The name of the model (users, products, categories, orders).
 * @param model - The mongoose model to use.
 * @param itemId - The ID of the item to be removed from the cache.
 * @throws {Error} - If the model does not exist.
 */
export const updateCacheDelete = async (
  modelName: string,
  model: Model<any>,
  itemId: string
): Promise<void> => {
  if (!models.includes(modelName)) {
    throw new Error(`Model ${modelName} does not exist in the database.`);
  }

  const cacheKey = modelName;
  const cached = await getCacheKey(cacheKey);

  if (cached) {
    const data = Array.isArray(cached) ? cached : [cached];

    if (modelName === 'categories') {
      const category = data.find(
        (category: CacheDocument) => category._id === itemId
      );

      const products = await getCacheKey('products');
      if (products && Array.isArray(products)) {
        const updatedProducts = products.filter(
          (product: CacheDocument) =>
            product.category?.name !== category?.category?.name
        );
        await setCacheKey('products', updatedProducts);
      }
    }

    const updatedData = data.filter(
      (item: CacheDocument) => item._id !== itemId
    );
    await setCacheKey(cacheKey, updatedData);
  } else {
    const allData = await model.find();
    const updatedData = allData.filter(
      (doc: CacheDocument) => doc._id !== itemId
    );
    await setCacheKey(cacheKey, updatedData);
  }
};
