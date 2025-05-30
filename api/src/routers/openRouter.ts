import express, { Router } from 'express';
import {
  validateIdParam,
  validateLoginInput,
  validateRegistrationInput,
  validateResetPassword,
} from '../middlewares/validationMiddleware';
import {
  getAllCategories,
  getAllProducts,
  getSingleProduct,
  getSingleCategory,
  login,
  registerUser,
  forgetPassword,
  resetPassword,
  verifyEmail,
} from '../controllers/openController';
import { uploadUser } from '../middlewares/uploadMiddleware';

const openRouter: Router = express.Router();

// Product routes
openRouter.get('/products', getAllProducts);
openRouter.get('/products/:id', validateIdParam, getSingleProduct);

// Category routes
openRouter.get('/categories', getAllCategories);
openRouter.get('/categories/:id', validateIdParam, getSingleCategory);

// User authentication routes
openRouter.post('/login', validateLoginInput, login);
openRouter.post(
  '/register',
  uploadUser.single('image'),
  validateRegistrationInput,
  registerUser
);
openRouter.post('/verify-email/', verifyEmail);
openRouter.post('/forget-password', forgetPassword);
openRouter.post('/reset-password', validateResetPassword, resetPassword);

export default openRouter;
