import { promises as fs } from 'fs';
import cloudinary from './cloudinary';
// import cloudinary from '../utils/cloudinary';
import { BadRequestError, NotFoundError } from '../errors/apiError';
// import Category from '../models/categoryModel';

import Product, { ProductDocument } from '../models/Product';
import User, { UserDocument } from '../models/User';
import globalRedisService from '../services/globalRedis.service';
import { setCacheKey } from './set-getRedisKeys';
import Category from '../models/Category';
import { FavoriteProductResponse, ProductData } from '../types/product';

/**
 * Checks if the given category exists and if the product already exists within that category.
 * Throws an error if the category does not exist or if a product with the same name already exists.
 *
 * @param {string} productName - The name of the product to check.
 * @param {string} categoryName - The name of the category to check.
 * @returns {Promise<void>} - Resolves if the checks pass, otherwise throws an error.
 *
 * @throws {BadRequestError} - If the category does not exist or the product already exists.
 */
export const productControl = async (
  productName: string,
  categoryName: string
): Promise<void> => {
  // Check if the category exists
  const categoryExists = await Category.findOne({ name: categoryName });
  if (!categoryExists) {
    throw new BadRequestError(
      `Cannot create product under ${categoryName} category, as it does not exist. Please create the ${categoryName} category first.`
    );
  }

  // Check if the product already exists
  const productExists = await Product.findOne({ name: productName });
  if (productExists) {
    throw new BadRequestError(
      `Product with name ${productName} already exists.`
    );
  }
};

/**
 * @description Adds a product to the user's list of favorites.
 * @param {string} productId - The ID of the product to add to favorites.
 * @param {string} userId - The ID of the user adding the product to favorites.
 * @returns {Object} The product that was added to favorites.
 * @throws {BadRequestError} If the product is already in the user's favorites.
 */
export const addProductToFavorites = async (
  productId: string,
  userId: string
): Promise<FavoriteProductResponse> => {
  const product: ProductDocument = await globalRedisService.findById(
    productId.toString(),
    'products'
  );

  if (!product) {
    throw new BadRequestError('Product not found');
  }
  if (product.favoritedBy?.includes(userId as any))
    throw new BadRequestError(`This product is already in your favorites`);

  // Add the user's ID to the favoritedBy array
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $addToSet: { favoritedBy: userId } }, // $addToSet ensures no duplicates
    { new: true } // Return the updated document
  );
  if (!updatedProduct) {
    throw new BadRequestError('Failed to update product favorites');
  }
  //update cache for all product
  const products = await Product.find();
  await setCacheKey('products', products);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { favorites: productId } }, // $addToSet ensures no duplicates
    { new: true } // Return the updated document
  );
  if (!updatedUser) {
    throw new BadRequestError('Failed to update user favorites');
  }
  //update cache for all product
  const users = await User.find();
  await setCacheKey('users', users);
  return { updatedProduct };
};

/**
 * @description Removes a product from the user's list of favorites.
 * @param {string} productId - The ID of the product to remove from favorites.
 * @param {string} userId - The ID of the user removing the product from favorites.
 * @returns {Object} The product that was removed from favorites.
 */
export const removeFavoriteProduct = async (
  productId: string,
  userId: string
) => {
  const product: ProductDocument = await globalRedisService.findById(
    productId.toString(),
    'products'
  );

  if (!product)
    throw new NotFoundError(`product with id ${productId} not found`);

  const user: UserDocument = await globalRedisService.findById(
    userId.toString(),
    'users'
  );

  if (!user) throw new NotFoundError(`User with id ${userId} not found`);

  if (!user.favorites?.includes(productId as any))
    throw new BadRequestError(
      `Product ${product.name} is not in your favorites`
    );

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $pull: { favoritedBy: userId } },
    { new: true } // Return the updated document
  );

  //update cache for all product
  const products = await Product.find();
  await setCacheKey('products', products);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $pull: { favorites: productId },
    },
    { new: true } // Return the updated document
  );

  //update cache for all product
  const users = await User.find();
  await setCacheKey('users', users);

  return { updatedProduct, updatedUser };
};

/**
 * Utility function to create a new product, upload its image to Cloudinary, and associate it with a category.
 *
 * @async
 * @function createProductUtils
 * @param {ProductData} productData - The data for the product, including an image file with a local path.
 * @param {string} productData.name - The name of the product.
 * @param {string} productData.category - The category name to which the product belongs.
 * @param {number} productData.price - The price of the product.
 * @param {string} [productData.description] - An optional description of the product.
 * @param {Object} productData.image - An object containing image details.
 * @param {string} productData.image.path - The local file path of the product image to be uploaded.
 *
 * @returns {Promise<IProduct>} - A promise that resolves to the newly created product document.
 *
 * @throws {Error} - Throws an error if Cloudinary upload or file deletion fails.
 *
 * @example
 * const productData = {
 *   name: 'Sample Product',
 *   category: 'Electronics',
 *   price: 299.99,
 *   description: 'A sample product description',
 *   image: { path: '/local/path/to/image.jpg' }
 * };
 *
 * const newProduct = await createProductUtils(productData);
 * console.log(newProduct);
 */
export const createProductUtils = async (
  productData: ProductData
): Promise<ProductDocument> => {
  const imagePath = productData.image;
  if (!imagePath) {
    throw new BadRequestError('Image is required');
  }

  // Upload product image to Cloudinary
  const response = await cloudinary.uploader.upload(imagePath, {
    width: 300,
    crop: 'scale',
  });

  // Update product data with Cloudinary response
  productData.image = response.secure_url;
  productData.imagePublicId = response.public_id;

  // Delete image from local machine before saving updates to the database
  await fs.unlink(imagePath);

  // Create the new product in the database
  const newProduct = await Product.create(productData);

  // Update the category to include the new product
  await Category.findOneAndUpdate(
    { name: newProduct.category },
    { $push: { products: newProduct._id } }
  );

  return newProduct;
};

/**
 * Updates a product's information, including uploading a new image to Cloudinary and deleting the old one if needed.
 *
 * @async
 * @function updateProductUtils
 * @param {Express.Multer.File | null} image - The new image file, if available, or null.
 * @param {string} productId - The ID of the product to be updated.
 * @param {ProductData} productData - The data to update in the product, including fields like name, price, etc.
 * @returns {Promise<IProduct | null>} - Resolves to the updated product document or null if not found.
 *
 * @throws {Error} - Throws an error if the Cloudinary upload or file deletion fails.
 */
export const updateProductUtils = async (
  image: Express.Multer.File | null,
  productId: string,
  productData: ProductData
): Promise<ProductDocument> => {
  try {
    // Get the current product before any updates
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      throw new NotFoundError(`Product with id ${productId} not found`);
    }

    const oldImagePublicId = existingProduct.imagePublicId;

    if (image) {
      try {
        // Upload new product image to Cloudinary with timestamp to force uniqueness
        const timestamp = new Date().getTime();
        const newPublicId = `products/${timestamp}_${image.originalname.replace(
          /\.[^/.]+$/,
          ''
        )}`;

        const uploadResponse = await cloudinary.uploader.upload(image.path, {
          width: 300,
          crop: 'scale',
          unique_filename: true,
          overwrite: false,
          public_id: newPublicId,
        });

        // Delete the image from the local machine
        await fs.unlink(image.path);

        // Update product data with new image info - store URL directly as string
        productData.image = uploadResponse.secure_url;
        productData.imagePublicId = uploadResponse.public_id;
      } catch (uploadError) {
        // Clean up the local file if it exists, regardless of where the error occurred
        try {
          await fs.unlink(image.path);
        } catch (unlinkError) {
          // Ignore unlink errors as the file might already be deleted
        }
        throw new Error(
          `Failed to process image: ${
            uploadError instanceof Error ? uploadError.message : 'Unknown error'
          }`
        );
      }
    }

    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      productData,
      {
        new: true,
      }
    );

    if (!updatedProduct) {
      throw new NotFoundError(`Product with id ${productId} not updated`);
    }

    // If we uploaded a new image, delete the old one from Cloudinary
    if (image && oldImagePublicId) {
      try {
        await cloudinary.uploader.destroy(oldImagePublicId);
      } catch (deleteError) {
        // Don't throw here as the product update was successful
      }
    }

    // Update the products cache
    const products = await Product.find();
    await setCacheKey('products', products);

    return updatedProduct;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error; // Pass the error to be handled by the calling function
  }
};
