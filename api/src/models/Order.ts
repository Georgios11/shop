import mongoose, { Document } from 'mongoose';
import { ORDER_STATUS } from '../util/constants';

/**
 * @typedef {Object} OrderItem
 * @property {string} name - Name of the product
 * @property {number} qty - Quantity of the product
 * @property {string} image - Image URL of the product
 * @property {number} price - Price of the product
 * @property {mongoose.Schema.Types.ObjectId} product - Reference to the Product model
 */

/**
 * Order Schema
 * @typedef {Object} Order
 * @property {mongoose.Schema.Types.ObjectId} user - Reference to the User or Guest model
 * @property {string} userModel - Indicates whether the user is a 'User' or 'Guest'
 * @property {OrderItem[]} orderItems - List of order items
 * @property {number} totalPrice - Total price of the order
 * @property {string} status - Status of the order
 * @property {Date} createdAt - Timestamp when the order was created
 * @property {Date} updatedAt - Timestamp when the order was last updated
 */

export type OrderItemDocument = Document & {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: mongoose.Types.ObjectId;
};

/**
 * @property {Types.ObjectId} user - Reference to the User or Guest model
 * @property {string} userModel - Indicates whether the user is a 'User' or 'Guest'
 * @property {Array<IOrderItem>} orderItems - Array of order items
 * @property {string} status - Status of the order
 * @property {number} totalPrice - Total price of the order
 * @property {Date} createdAt - The date and time when the order was created. Automatically set by Mongoose.
 * @property {Date} updatedAt - The date and time when the order was last updated. Automatically set by Mongoose.
 */
export type OrderDocument = Document & {
  user: mongoose.Types.ObjectId;
  userModel: string;
  orderItems: OrderItemDocument[];
  status: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  userType: string;
};
const orderSchema = new mongoose.Schema<OrderDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'userModel', // Dynamic reference
    },
    userModel: {
      type: String,
      required: true,
      enum: ['User', 'Guest'], // The possible models the user field can reference
    },
    userType: {
      type: String,
      required: true,
    },
    orderItems: [
      {
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PROCESSING,
    },
    // paymentMethod: {
    // 	type: String,
    // 	required: true,
    // },
    // paymentResult: {
    // 	id: { type: String },
    // 	status: { type: String },
    // 	update_time: { type: String },
    // 	email_address: { type: String },
    // },
    // taxPrice: {
    // 	type: Number,
    // 	required: true,
    // 	default: 0.0,
    // },
    // shippingPrice: {
    // 	type: Number,
    // 	required: true,
    // 	default: 0.0,
    // },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<OrderDocument>('Order', orderSchema);
