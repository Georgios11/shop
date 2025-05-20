import { BadRequestError } from '../errors/apiError';
import Product, { ProductDocument } from '../models/Product';
import User, { UserDocument } from '../models/User';
import Category, { CategoryDocument } from '../models/Category';
import Order, { OrderDocument } from '../models/Order';
import mongoose, { Model, Document, FilterQuery } from 'mongoose';
import { getCacheKey, setCacheKey } from './set-getRedisKeys';

/**
 * Interface representing the structure of paginated results.
 *
 * @template T - The type of documents being paginated.
 * @property {T[]} documents - The array of documents for the current page.
 * @property {number} startIndex - The starting index of the documents in the current page.
 * @property {number} endIndex - The ending index of the documents in the current page.
 * @property {number} count - Total number of documents.
 * @property {number} availablePages - Total number of pages available.
 */
interface PaginationResult<T> {
  documents: T[];
  startIndex: number;
  endIndex: number;
  count: number;
  availablePages: number;
}

/**
 * Utility function to paginate an array of documents.
 *
 * @template T - The type of documents being paginated.
 * @param {T[]} allDocuments - Array of all documents fetched from the database.
 * @param {number} page - The current page number.
 * @param {number} pageSize - The number of documents per page.
 * @returns {PaginationResult<T>} An object containing paginated documents and metadata.
 * @throws {BadRequestError} If the requested page exceeds the available pages.
 */
const paginateDocuments = <T>(
  allDocuments: T[],
  page: number
): PaginationResult<T> => {
  const pageSize = 6;
  const count = allDocuments.length;
  const availablePages = Math.ceil(count / pageSize);

  if (page > availablePages && count > 0) {
    throw new BadRequestError(
      `There are only ${availablePages} pages available.`
    );
  }

  const documents = allDocuments.slice((page - 1) * pageSize, page * pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, count);

  return {
    documents,
    startIndex,
    endIndex,
    count,
    availablePages,
  };
};

/**
 * Fetches all collection names from the MongoDB database.
 *
 * @async
 * @function getAllCollections
 * @param {boolean} [filterForModels=true] - If true, filters collections to only those with Mongoose models.
 * @returns {Promise<string[]>} A Promise that resolves to an array of collection names in the database.
 * @throws {Error} If the database is not connected.
 */

async function getAllCollections(filterForModels = true): Promise<string[]> {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected');
  }
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database not connected');
  }
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map((col) => col.name);

  return collectionNames;
}

/**
 * Fetches paginated results from the database based on model and query conditions.
 *
 * @async
 * @template T - The type of documents being paginated.
 * @param {number} [page=1] - The current page number.
 * @param {Model<T>} model - The Mongoose model to fetch documents from.
 * @param {string} modelName - The name of the model used for error messages and validation.
 * @param {object} [keyword={}] - The search/filter criteria for the documents.
 * @returns {Promise<PaginationResult<T>>} A Promise containing paginated documents and metadata.
 * @throws {BadRequestError} If the model collection does not exist or the page exceeds available pages.
 */
function isObjectEmpty(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}
export const paginate = async <T extends Document>(
  page: number = 1,
  model: Model<T>,
  modelName: string,
  keyword: object = {}
): Promise<PaginationResult<T>> => {
  const collections = await getAllCollections();

  if (!collections.includes(modelName)) {
    throw new BadRequestError(
      `${modelName} collection does not exist in database. USE PLURAL`
    );
  }
  const queryCondition: FilterQuery<T> = { ...keyword };
  // Optional filtering for User model to exclude admin users
  // if (modelName === 'users') {
  //   (queryCondition as any)['role'] = { $ne: 'admin' };
  // }

  let cacheDataKey;
  //   Object.keys(keyword).length > 0
  //     ? `${modelName}${JSON.stringify(queryCondition)}`
  //     : `${modelName}`;

  // if (isObjectEmpty(queryCondition)) {
  //   cacheDataKey = modelName;
  // } else {
  //   cacheDataKey = `${modelName}${JSON.stringify(queryCondition)}`;
  // }

  const cached = await getCacheKey(modelName);

  if (cached) {
    return paginateDocuments(cached, page);
  } else {
    // Fetch documents from the database and store in cache
    const allDocuments = await model.find(queryCondition);
    await setCacheKey(modelName, allDocuments);

    return paginateDocuments(allDocuments, page);
  }
};
