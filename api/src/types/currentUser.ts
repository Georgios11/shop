import { ObjectId } from 'mongoose';
import { Cart } from '../models/User';

export interface BaseUser {
  role: string;
  cart?: Cart;
  createdAt?: Date;
  updatedAt?: Date;
  orders: string[];
}

// Define a User-specific interface
export interface UserCurrentUser extends BaseUser {
  role: 'user'; // Discriminator
  userId: ObjectId | string; // Required for registered users
  name: string;
  email: string;
  phone?: string;
  is_banned?: boolean;
  favorites?: ObjectId[];
}

export type CurrentUser = UserCurrentUser;
