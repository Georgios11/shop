import { Cart } from './cart';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  is_banned: boolean;
  createdAt: string;
  updatedAt: string;
  image?: string;
  imagePublicId?: string;
  cart?: Cart;
  favorites?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface CurrentUser extends User {
  favorites: string[];
}
