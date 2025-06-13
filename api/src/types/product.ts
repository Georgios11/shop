import { ObjectId } from 'mongoose';

/**
 * Interface for category structure used in product data.
 */
export interface Category {
  name: string;
  id: ObjectId | null;
}

/**
 * Interface for initial product data structure.
 */
export interface IInitialProduct {
  name: string;
  image: string;
  description: string;
  brand: string;
  category: Category;
  price: number;
  itemsInStock: number;
  rating: number;
  numReviews: number;
}

/**
 * Interface for favorite product response.
 */
export interface FavoriteProductResponse {
  updatedProduct: any;
}

/**
 * Interface for product data used in creation and updates.
 */
export interface ProductData {
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  imagePublicId?: string;
  [key: string]: any; // Allow additional properties
}
