import { lazy } from 'react';

export const LazyAdminDashboard = lazy(() => import('./AdminDashboard'));
export const LazyManageUsers = lazy(() => import('./ManageUsers'));
export const LazyManageProducts = lazy(() => import('./ManageProducts'));
export const LazyManageCategories = lazy(() => import('./ManageCategories'));
export const LazySingleProductAdmin = lazy(
  () => import('./SingleProductAdmin')
);
export const LazyCreateProduct = lazy(() => import('./CreateProduct'));
export const LazyManageOrders = lazy(() => import('./ManageOrders'));

// ...add more as needed
