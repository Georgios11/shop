import { CART_STATUS } from './constants';
import { getCacheKey, setCacheKey } from './set-getRedisKeys';
import { BadRequestError } from '../errors/apiError';

import Product, { ProductDocument } from '../models/Product';
import globalRedisService from '../services/globalRedis.service';
import User, { CartItem } from '../models/User';
import mongoose from 'mongoose';

import { CurrentUser } from '../types/currentUser';

/**
 * Updates the given `cart` object with new values from `newValues`.
 * If a property exists in both the `cart` and `newValues`, the value in `cart` is overwritten.
 *
 * @param {Cart} cart - The original cart object that needs to be updated.
 * @param {Partial<Cart>} newValues - An object containing new key-value pairs to update the cart.
 * @returns {Cart} The updated cart object.
 */

/**
 * Calculate the total price of items in the cart.
 *
 * @param {CartItem[]} items - Array of cart items.
 * @returns {number} - Total price of all items.
 */
export const calculateTotalPrice = (items: CartItem[] = []): number => {
  return parseFloat(
    items
      .reduce((total, item) => total + item.quantity * item.price, 0)
      .toFixed(2)
  );
};

/**
 * Set the cookie name based on request headers and user role.
 *
 * @param {Request} req - The request object.
 * @param {CurrentUser} currentUser - The current user object.
 * @returns {string} The cookie name.
 */
// export const setCookieName = (
//   req: { headers: { cookie?: string } },
//   currentUser: CurrentUser
// ): string => {
//   if (!req.headers.cookie && currentUser.role === 'guest') {
//     return 'guestId';
//   } else {
//     return req.headers.cookie?.split('=')[0] ?? '';
//   }
// };

/**
 * Checks if the product is in stock and throws an error if it's not.
 *
 * @param {any} product - The product object to check stock for.
 * @param {CurrentUser} currentUser - The current user object.
 * @param {string} userType - The type of the user, either "guest" or "user".
 * @throws {BadRequestError} - Throws an error if the product is out of stock.
 */
/**
 * Checks if a product is in stock and provides appropriate messages based on user's favorites
 * @param product - The product to check stock for
 * @param currentUser - The current user (if logged in)
 * @throws {BadRequestError} - With appropriate message based on stock and favorites status
 */
const checkStock = (
  product: ProductDocument,
  currentUser: CurrentUser | null
): void => {
  if (product.itemsInStock === 0) {
    const productId = product._id as unknown as mongoose.Types.ObjectId;

    // If user is logged in and product is in their favorites
    if (
      currentUser?.favorites?.some(
        (favId) => favId.toString() === productId.toString()
      )
    ) {
      throw new BadRequestError(
        `${product.name} is out of stock. You will be notified as soon as it becomes available`
      );
    }

    // If user is not logged in or product is not in their favorites
    throw new BadRequestError(
      `${product.name} is out of stock. Add it to your favorites and you will be notified as soon as it becomes available`
    );
  }
};
/**
 * Adds an item to the user's cart, initializes the cart if it doesn't exist,
 * and updates the cart in both Redis and the database.
 *
 * @async
 * @function addItem
 * @param {CurrentUser} currentUser - The current user object, which includes user details and the cart.
 * @param {string} productId - The ID of the product to be added to the cart.
 * @returns {Promise<{ updatedProduct: ProductDocument, currentUser: CurrentUser, products: ProductDocument[], users: any[] }>} A promise that resolves to an object containing the updated data.
 */
export const addItem = async (
  currentUser: CurrentUser,
  productId: string
): Promise<{
  updatedProduct: ProductDocument;
  currentUser: CurrentUser;
  products: ProductDocument[];
  users: any[];
}> => {
  // Fetch product details
  const product: ProductDocument = await globalRedisService.findById(
    productId.toString(),
    'products'
  );

  // Check stock availability
  checkStock(product, currentUser);

  // Initialize cart if it doesn't exist
  if (!currentUser.cart) {
    currentUser.cart = {
      user: currentUser.userId!,
      items: [],
      totalPrice: 0.0,
      status: CART_STATUS.ACTIVE,
      userType: 'user', // Always set to 'user' since we removed guest functionality
    };
  }

  const cart = currentUser.cart;

  // Update existing item quantity or add new item
  cart.items = cart.items.map((item) => {
    if (item.productId.toString() === productId.toString()) {
      return { ...item, quantity: item.quantity + 1 };
    }
    return item;
  });

  // Add new item if it doesn't exist in cart
  if (
    !cart.items.some(
      (item) => item.productId.toString() === productId.toString()
    )
  ) {
    cart.items.push({
      productId,
      productName: product.name,
      quantity: 1,
      image: product.image,
      price: Number(product.price),
    });
  }

  // Update product stock
  const updatedProduct = await Product.findByIdAndUpdate(
    product._id,
    { $inc: { itemsInStock: -1 } },
    { new: true }
  );

  if (!updatedProduct) {
    throw new BadRequestError(`Error updating product stock quantity`);
  }

  // Update cart total price
  cart.totalPrice = parseFloat(calculateTotalPrice(cart.items).toFixed(2));

  // Update user cart in database and cache
  const [updatedUser, products] = await Promise.all([
    User.findByIdAndUpdate(
      currentUser.userId!.toString(),
      { cart: currentUser.cart },
      { new: true }
    ),
    Product.find(),
  ]);

  if (!updatedUser) {
    throw new BadRequestError(`User cart not updated in database`);
  }

  // Update caches
  await Promise.all([
    setCacheKey('products', products),
    User.find().then((users) => setCacheKey('users', users)),
  ]);

  const users = await getCacheKey('users');
  return { updatedProduct, currentUser, products, users };
};
// Helper to check if user has an active cart
export const hasActiveCart = (currentUser: CurrentUser): boolean => {
  return !!(currentUser.cart && currentUser.cart.status !== 'undefined');
};

// Helper to update product stock
export const updateProductStock = async (
  productId: string,
  incrementBy = 1
) => {
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $inc: { itemsInStock: incrementBy } },
    { new: true }
  );
  if (!updatedProduct) throw new BadRequestError(`Product stock not updated`);
  const products = await Product.find();
  await setCacheKey('products', products);
};

// Helper to update the cart in the database and cache
export const updateUserCart = async (currentUser: CurrentUser) => {
  const updatedUser = await User.findByIdAndUpdate(
    currentUser.userId,
    { cart: currentUser.cart },
    { new: true }
  );
  if (!updatedUser) throw new BadRequestError(`User cart not updated`);
  const users = await User.find().select('-password');
  await setCacheKey('users', users);
};

// Helper to remove item or adjust quantity in the cart
export const modifyCartItemQuantity = (
  cartItems: CartItem[],
  productId: string,
  quantityChange: number
) => {
  return cartItems.map((item) => {
    if (item.productId.toString() === productId) {
      return { ...item, quantity: item.quantity + quantityChange };
    }
    return item;
  });
};
