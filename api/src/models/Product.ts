import mongoose, { Document } from 'mongoose';

/**
 * Mongoose schema for the Product model.
 *
 * This schema defines the structure of the Product documents in the MongoDB database.
 * It includes fields for name, createdBy, slug, description, image, brand, price, itemsInStock,
 * and an array of users who have favorited the product.
 *
 * @const {mongoose.Schema} productSchema
 * @property {String} name - The name of the product, which is required and trimmed.
 * @property {mongoose.Schema.Types.ObjectId} createdBy - The ID of the user who created the product, which is required.
 * @property {String} slug - The slug for the product, which is required, lowercase, and unique.
 * @property {String} description - The description of the product, which is required and trimmed.
 * @property {String} image - The URL of the product image, which is required.
 * @property {String} brand - The brand of the product, which is required.
 * @property {Number} price - The price of the product, which is required and defaults to 0.
 * @property {Number} itemsInStock - The number of items in stock, which is required and defaults to 0.
 * @property {Array<mongoose.Schema.Types.ObjectId>} favoritedBy - An array of user IDs who have favorited the product.
 * @property {Date} createdAt - The date and time when the product was created. Automatically set by Mongoose.
 * @property {Date} updatedAt - The date and time when the product was last updated. Automatically set by Mongoose.
 */
export type ProductDocument = Document & {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  brand: string;
  itemsInStock: number;
  favoritedBy: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  slug: string;
  description: string;
  image: string;
  imagePublicId: string;
  category: {
    name: string;
    id: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
};

const productSchema = new mongoose.Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    imagePublicId: String,
    brand: {
      type: String,
      required: true,
    },
    category: {
      name: { type: String, required: true, lowercase: true },
      id: { type: mongoose.Types.ObjectId, ref: 'Category' },
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    itemsInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    favoritedBy: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ProductDocument>('Product', productSchema);
