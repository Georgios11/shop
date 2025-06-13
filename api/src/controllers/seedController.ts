import Product, { ProductDocument } from '../models/Product';
import User from '../models/User';
import initialUsers from '../data/users';
import initialProducts from '../data/products';
import successResponse from '../util/responseUtils';
import { StatusCodes } from 'http-status-codes';
import Category, { CategoryDocument } from '../models/Category';
import slugify from 'slugify';
import Order from '../models/Order';
import { ObjectId } from 'mongodb';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import responseUtils from '../util/responseUtils';
import { setCacheKey } from '../util/set-getRedisKeys';
import { redisClient } from '../util/redisClient';
import { uploadImageToCloudinary } from '../util/cloudinaryUtils';
import cloudinary from '../util/cloudinary';

/**
 * Deletes all existing data from specified collections in the MongoDB database.
 *
 * This function performs batch deletion of documents from the `Category`, `User`, `Product`, `Guest`,
 * and `Order` collections, using `deleteMany()` for each. It executes all deletions concurrently
 * using `Promise.all()` for improved performance.
 *
 * @async
 * @function deleteExistingData
 * @throws {Error} - Throws an error if any deletion operation fails, allowing upper layers to handle it.
 */
const deleteExistingData = async () => {
  try {
    // Parallel fetch of products and users
    const [products, users] = await Promise.all([Product.find(), User.find()]);

    // Batch Cloudinary deletions
    const cloudinaryDeletions = [
      ...products.filter((p) => p.imagePublicId).map((p) => p.imagePublicId),
      ...users.filter((u) => u.imagePublicId).map((u) => u.imagePublicId),
    ];

    // Single batch delete for Cloudinary
    if (cloudinaryDeletions.length > 0) {
      await cloudinary.api.delete_resources(cloudinaryDeletions);
    }

    // Parallel database operations
    await Promise.all([
      Category.deleteMany(),
      User.deleteMany(),
      Product.deleteMany(),
      Order.deleteMany(),
      redisClient.flushAll(),
    ]);
  } catch (error) {
    console.error('Error deleting existing data:', error);
    throw error;
  }
};

// Optimize image uploads by batching
const uploadImagesToCloudinary = async (items: any[], folder: string) => {
  const uploadPromises = items.map(async (item) => {
    if (!item.image) return item;

    try {
      const result = await uploadImageToCloudinary(item.image, folder);
      return {
        ...item,
        image: result.secure_url,
        imagePublicId: result.public_id,
      };
    } catch (error) {
      console.error(`Failed to upload image for ${item.name}:`, error);
      return { ...item, image: item.image };
    }
  });

  return Promise.all(uploadPromises);
};

/**
 * Inserts initial users into the database.
 * @returns {Array} - Inserted users.
 */
const insertUsers = async (): Promise<any[]> => {
  try {
    const usersWithCloudinaryUrls = await uploadImagesToCloudinary(
      initialUsers,
      'users'
    );
    return await User.insertMany(usersWithCloudinaryUrls);
  } catch (error: unknown) {
    console.error('Error in insertUsers:', error);
    throw new Error('Failed to process users: ' + (error as Error).message);
  }
};

/**
 * Inserts initial products into the database and associates them with a user that inserted them into the db (admin).
 * @param {ObjectId} createdBy - ID of the user who created the products (initialUsers[0] has admin privileges)
 * @returns {Array} - Inserted products.
 */
const insertProducts = async (
  createdBy: ObjectId
): Promise<ProductDocument[]> => {
  try {
    const productsWithCloudinaryUrls = await uploadImagesToCloudinary(
      initialProducts.map((p) => ({ ...p, createdBy })),
      'products'
    );
    const insertedProducts = await Product.insertMany(
      productsWithCloudinaryUrls
    );
    return insertedProducts as ProductDocument[];
  } catch (error: unknown) {
    console.error('Error in insertProducts:', error);
    throw new Error('Failed to process products: ' + (error as Error).message);
  }
};

/**
 * Generates unique categories from products, maps products to categories, and inserts categories into the database.
 * @param {Array} products - List of inserted products.
 * @param {ObjectId} createdBy - ID of the user who created the categories.
 * @returns {Array} - Inserted categories.
 */
const generateAndInsertCategories = async (
  products: ProductDocument[],
  createdBy: ObjectId
): Promise<CategoryDocument[]> => {
  const categoriesMap = new Map();

  // Single pass through products
  products.forEach((product) => {
    const {
      category: { name },
      _id,
    } = product;
    const slug = slugify(name, { lower: true });

    if (!categoriesMap.has(name)) {
      categoriesMap.set(name, {
        name,
        createdBy,
        products: [],
        slug,
      });
    }
    categoriesMap.get(name).products.push(_id);
  });

  return (await Category.insertMany(
    Array.from(categoriesMap.values())
  )) as unknown as CategoryDocument[];
};

/**
 * Maps categories to products by adding a category ID to each product.
 * @param {Array} products - List of inserted products.
 * @param {Array} categories - List of inserted categories.
 * @returns {Array} - Updated products with category IDs.
 */
const mapCategoriesToProducts = async (
  products: ProductDocument[],
  categories: CategoryDocument[]
): Promise<ProductDocument[]> => {
  const categoryMap = new Map(
    categories.flatMap((category) =>
      category.products.map((productId) => [productId.toString(), category._id])
    )
  );

  const bulkOps = products.map((product: ProductDocument) => ({
    updateOne: {
      filter: { _id: product._id },
      update: {
        $set: {
          category: {
            id: categoryMap.get(product._id.toString()),
            name: product.category.name,
          },
        },
      },
    },
  }));

  await Product.bulkWrite(bulkOps);

  return products.map((product: ProductDocument) => ({
    ...product.toObject(),
    category: {
      id: categoryMap.get(product._id.toString()),
      name: product.category.name,
    },
  }));
};

/**
 * @openapi
 * /api/v1/seed:
 *   post:
 *     summary: Hydrates database with initial data
 *     description: Hydrates the database with initial users, products, categories, and orders. Only accessible to admins.
 *     tags:
 *       - Seed
 *     operationId: seedData
 *     security:
 *     responses:
 *       200:
 *         description: OK - Database successfully seeded.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Database hydrated"
 *       400:
 *         description: Bad Request - Database initialization failed due to invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "There was a problem initializing the database"
 *       500:
 *         description: Internal Server Error - An unexpected error occurred during seeding.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred on the server."
 */

export const seedData: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteExistingData();

    // First insert users and wait for it to complete
    const users = await insertUsers();

    // Then find the admin user
    const admin = await User.findOne({ email: 'admin@email.com' });
    if (!admin) {
      throw new Error('Admin user not found during seeding');
    }

    const products = await insertProducts(new ObjectId(admin._id));

    // Parallel category operations and cache updates
    const [categories, orders] = await Promise.all([
      generateAndInsertCategories(products, new ObjectId(admin._id)),
      Order.find(),
    ]);

    const finalProducts = await mapCategoriesToProducts(products, categories);

    // Batch cache updates
    await Promise.all([
      setCacheKey('users', users),
      setCacheKey('categories', categories),
      setCacheKey('products', finalProducts),
      setCacheKey('orders', orders),
    ]);

    // After seeding the database
    // await setCacheKey('products', await Product.find());

    // Clear cookies and user session
    Object.keys(req.cookies).forEach((cookieName) => {
      res.clearCookie(cookieName, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
    });
    delete req.user;

    responseUtils.successResponse(res, StatusCodes.OK, 'Database hydrated', {
      data: {
        products: finalProducts,
      },
    });
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};
