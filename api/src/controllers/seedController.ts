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
    // First, get all products and users to delete their Cloudinary images
    const [products, users] = await Promise.all([Product.find(), User.find()]);

    // Delete all product and user images from Cloudinary
    const cloudinaryDeletions = [
      ...products
        .filter((product) => product.imagePublicId)
        .map((product) => cloudinary.uploader.destroy(product.imagePublicId)),
      ...users
        .filter((user) => user.imagePublicId)
        .map((user) => cloudinary.uploader.destroy(user.imagePublicId)),
    ];

    // Wait for all Cloudinary deletions to complete
    await Promise.all(cloudinaryDeletions);

    // Delete documents from MongoDB
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

/**
 * Inserts initial users into the database.
 * @returns {Array} - Inserted users.
 */
const insertUsers = async (): Promise<any[]> => {
  try {
    const uploadPromises = initialUsers.map(async (user) => {
      try {
        if (!user.image) {
          return user;
        }

        // Upload user image to Cloudinary
        const result = await uploadImageToCloudinary(user.image, 'users');

        return {
          ...user,
          image: result.secure_url,
          imagePublicId: result.public_id,
        };
      } catch (error: unknown) {
        const err = error as Error;
        console.error(
          `Failed to upload image for user ${user.name}:`,
          err.message,
          '\nImage URL:',
          user.image
        );
        // If upload fails, use the original image URL
        return {
          ...user,
          image: user.image,
        };
      }
    });

    const usersWithCloudinaryUrls = await Promise.all(uploadPromises);
    const insertedUsers = await User.insertMany(usersWithCloudinaryUrls);
    return insertedUsers;
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in insertUsers:', err.message);
    throw new Error('Failed to process users: ' + err.message);
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
    const uploadPromises = initialProducts.map(async (product) => {
      try {
        // Use the utility function instead of direct cloudinary upload
        const result = await uploadImageToCloudinary(product.image);

        return {
          ...product,
          createdBy,
          image: result.secure_url,
          imagePublicId: result.public_id, // Store the Cloudinary public ID
        };
      } catch (error: unknown) {
        const err = error as Error;
        console.error(
          `Failed to upload image for ${product.name}:`,
          err.message,
          '\nImage URL:',
          product.image
        );
        // If upload fails, use the original image URL
        return {
          ...product,
          createdBy,
          image: product.image,
        };
      }
    });

    const productsWithCloudinaryUrls = await Promise.all(uploadPromises);
    const insertedProducts = await Product.insertMany(
      productsWithCloudinaryUrls
    );
    return insertedProducts as unknown as ProductDocument[];
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in insertProducts:', err.message);
    throw new Error('Failed to process products: ' + err.message);
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
): Promise<any[]> => {
  const categoriesMap = new Map();

  products.forEach((product) => {
    const {
      category: { name: categoryName },
      _id: productId,
    } = product;

    const slug = slugify(categoryName, { lower: true });
    if (!categoriesMap.has(categoryName)) {
      categoriesMap.set(categoryName, {
        name: categoryName,
        createdBy,
        products: [],
        slug,
      });
    }
    categoriesMap.get(categoryName).products.push(productId);
  });

  const createdCategories = Array.from(categoriesMap.values());
  const categories = await Category.insertMany(createdCategories);
  return categories;
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
): Promise<any[]> => {
  const categoryMap = new Map();
  categories.forEach((category) => {
    category.products.forEach((productId) => {
      categoryMap.set(productId.toString(), category._id);
    });
  });

  const updatedProducts = products.map((product: any) => {
    const categoryId = categoryMap.get(product._id.toString());
    return {
      ...product._doc, // Spread the document fields
      category: { id: categoryId, name: product.category.name },
    };
  });

  await Promise.all(
    updatedProducts.map((product: any) =>
      Product.updateOne({ _id: product._id }, { category: product.category })
    )
  );

  return updatedProducts;
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
    // Delete existing data, except admin who made seed request
    await deleteExistingData();

    // early return for testing purposes
    // return successResponse(res, StatusCodes.OK, "Hydration");

    // Insert users and create products with user associations
    const users = await insertUsers();

    await setCacheKey('users', users);

    //get admin id
    // const createdBy = userId;
    const admin = await User.findOne({ email: 'admin@email.com' });
    if (!admin) {
      throw new Error('Admin user not found during seeding');
    }
    const products = await insertProducts(new ObjectId(admin._id));
    //initialize guest  cache

    //initialize order cache
    const orders = await Order.find();
    await setCacheKey('orders', orders);

    // Generate and insert categories
    const categories = await generateAndInsertCategories(
      products as ProductDocument[],
      new ObjectId(admin._id)
    );
    await setCacheKey('categories', categories);

    const finalProducts = await mapCategoriesToProducts(
      products as ProductDocument[],
      categories as CategoryDocument[]
    );
    await setCacheKey('products', finalProducts);

    if (!users || !categories || !finalProducts) {
      throw new Error('There was a problem initializing the database');
    }
    // Log out the user if they are logged in
    for (const cookieName in req.cookies) {
      // Clear each cookie
      res.clearCookie(cookieName, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
    }
    delete req.user;
    // Return success response
    responseUtils.successResponse(res, StatusCodes.OK, 'Database hydrated');
  } catch (error) {
    responseUtils.errorResponse(error, next);
  }
};
