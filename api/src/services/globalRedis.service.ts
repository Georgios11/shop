import { Model, Document } from 'mongoose';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '../errors/apiError';
import { getCacheKey } from '../util/set-getRedisKeys';

/**
 * Generic function to find a document by its ID in any given Mongoose model.
 *
 * @param model - The Mongoose model to query (e.g., User, Product).
 * @param id - The ObjectId of the document to find.
 * @returns A Promise resolving to the found document or throws an error if not found.
 */

const cacheKeys = ['users', 'orders', 'products', 'categories'];
const isValidCacheKey = (key: string): boolean => {
  return cacheKeys!.includes(key.toLowerCase());
};
const findById = async <T extends Document>(
  id: string,
  modelName: string
): Promise<T> => {
  try {
    if (!isValidCacheKey(modelName))
      throw new BadRequestError('Invalid cache key');

    let data = await getCacheKey(modelName.toLowerCase());

    // Check if the document was not found
    if (data === null) {
      // Throw a NotFoundError if the document is not found
      throw new NotFoundError(`${modelName} with id ${id} not found `);
    }
    const document = data.find((item: any) => item._id === id.toString());
    if (!document) {
      // Throw a NotFoundError if the document is not found
      throw new NotFoundError(`${modelName} with id ${id} not found `);
    }
    return document as T;
  } catch (error: unknown) {
    // Wrap any other errors in an InternalServerError, preserving the original error as the source

    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      // Re-throw specific custom errors without wrapping
      throw error;
    }

    // For unknown errors, wrap and throw as InternalServerError
    throw new InternalServerError(`Failed to fetch document with ID: ${id}`);
  }
};

/**
 * Fetches all documents from the specified MongoDB model collection.
 *
 * This asynchronous function retrieves all documents for a given Mongoose model. If no documents
 * are found, a `NotFoundError` is thrown. If an unexpected error occurs, it is wrapped and re-thrown
 * as an `InternalServerError`.
 *
 * @async
 * @template T - The type of documents being fetched, extending Mongoose's Document interface.
 * @param {Model<T>} model - The Mongoose model to fetch documents from.
 * @param {string} modelName - The name of the model, used for error messages.
 * @returns {Promise<T[]>} A promise that resolves to an array of documents of type `T`.
 * @throws {NotFoundError} If no documents are found in the specified model collection.
 * @throws {InternalServerError} If an unexpected error occurs while fetching the documents.
 *

 */

const findAll = async <T extends Document>(
  model: Model<T>,
  modelName: string
): Promise<T[]> => {
  try {
    // Retrieve all documents for the specified model
    let data = await getCacheKey(modelName.toLowerCase());

    if (!data.length) data = await model.find().exec();

    // If no documents are found, optionally throw a NotFoundError (if required by your logic)
    if (!data || data.length === 0) {
      throw new NotFoundError(`No ${modelName} records found`);
    }

    return data;
  } catch (error) {
    // If we encounter an unknown error, wrap and throw as an InternalServerError
    throw new InternalServerError(`Failed to fetch ${modelName} records`);
  }
};
export default { findById, findAll };
