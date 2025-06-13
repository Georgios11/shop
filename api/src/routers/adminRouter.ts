import express, { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  deleteUserAccount,
  banUser,
  unbannUser,
  changeUserStatus,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllOrders,
  getSingleOrder,
  createProduct,
} from '../controllers/adminController';
import {
  validateCategory,
  validateIdParam,
  validateProductInput,
} from '../middlewares/validationMiddleware';

import { uploadProducts } from '../middlewares/uploadMiddleware';
const adminRouter: Router = Router();
//user related routes
adminRouter.route('/users').get(getAllUsers);
adminRouter.put('/users/ban-user/:id', validateIdParam, banUser);
adminRouter.put('/users/unbann-user/:id', validateIdParam, unbannUser);
adminRouter.put(
  '/users/change-user-status/:id',
  validateIdParam,
  changeUserStatus
);
adminRouter
  .route('/users/:id')
  .delete(validateIdParam, deleteUserAccount)
  .get(validateIdParam, getUserById);

// category related routes
adminRouter.route('/categories').post(validateCategory, createCategory);

adminRouter.route('/categories/:id').delete(validateIdParam, deleteCategory);
adminRouter.route('/categories/:id').put(validateIdParam, updateCategory);

//product related routes
adminRouter.route('/products/:id').delete(validateIdParam, deleteProduct);
adminRouter
  .route('/products')
  .post(uploadProducts.single('image'), validateProductInput, createProduct);

adminRouter
  .route('/products/:id')
  .put(uploadProducts.single('image'), validateIdParam, updateProduct);

adminRouter.get('/orders', getAllOrders);
adminRouter.get('/orders/:id', getSingleOrder);
export default adminRouter;
