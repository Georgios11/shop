import { Router } from 'express';

import {
  validateIdParam,
  validateUpdateUserInput,
} from '../middlewares/validationMiddleware';

import { uploadUser } from '../middlewares/uploadMiddleware';
import {
  deleteAccount,
  favoriteProduct,
  getCart,
  getFavorites,
  getOrders,
  getUserProfile,
  placeOrder,
  logout,
  removeCartItem,
  removeFavorite,
  updateUser,
  addCartItem,
} from '../controllers/userController';
import { refreshToken } from '../controllers/refreshTokenController';
const userRouter: Router = Router();

userRouter.post('/logout', logout);
userRouter.get('/orders', getOrders);
userRouter.get('/favorites', getFavorites);
userRouter.get('/profile', getUserProfile);
userRouter.post('/add-favorite/:id', validateIdParam, favoriteProduct);
userRouter.delete('/delete-favorite/:id', validateIdParam, removeFavorite);

userRouter.delete('/delete-account', deleteAccount);
userRouter.put(
  '/update-user',
  uploadUser.single('image'),
  validateUpdateUserInput,
  updateUser
);
userRouter.post('/refresh-token', refreshToken);
userRouter.get('/cart', getCart);
userRouter.post('/order', placeOrder);
userRouter.post('/:id', validateIdParam, addCartItem);
userRouter.delete('/:id', validateIdParam, removeCartItem);
export default userRouter;
