import mongoose, { Document, ObjectId } from 'mongoose';
import { USER_ROLE } from '../util/constants';

/**
 * Defines the structure of a CartItem.
 */

export type CartItem = {
  productId: ObjectId | string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
};

/**
 * Defines the structure of a Cart.
 */
export type Cart = {
  user: ObjectId | string | null;
  items: CartItem[];
  totalPrice: number;
  status: string;
  userType: string;
};

// Define the CartItem schema for each item in the cart
const cartItemSchema = new mongoose.Schema<CartItem>({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

// Define the Cart schema as an embedded document
export const cartSchema = new mongoose.Schema<Cart>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: { type: [cartItemSchema], default: [] },
  totalPrice: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
  userType: { type: String, default: 'user' },
});

// Define the UserDocument type
export type UserDocument = Document & {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  favorites: mongoose.Types.ObjectId[];
  orders: string[];
  cart: Cart;
  createdAt: Date;
  updatedAt: Date;
  phone: string;
  is_banned: boolean;
  image: string;
  imagePublicId: string;
};

// Define the user schema and embed the cart schema directly
const userSchema = new mongoose.Schema<UserDocument>(
  {
    name: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
    },
    password: { type: String, required: true },
    phone: String,
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.USER,
    },
    is_banned: {
      type: Boolean,
      default: false,
    },
    image: String,
    imagePublicId: String,
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: [],
      },
    ],
    cart: cartSchema, // Embed `cartSchema` directly to avoid redefinition
    orders: [
      {
        type: String,
        ref: 'Order',
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<UserDocument>('User', userSchema);
