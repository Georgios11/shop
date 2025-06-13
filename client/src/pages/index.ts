import { lazy } from 'react';

export const LazyActivate = lazy(() => import('./Activate'));
export const LazyCart = lazy(() => import('./Cart'));
export const LazyCheckout = lazy(() => import('./Checkout'));
export const LazyForbidden = lazy(() => import('./Forbidden'));
export const LazyForgotPassword = lazy(() => import('./ForgotPassword'));
export const LazyHome = lazy(() => import('./Home'));
export const LazyLogin = lazy(() => import('./Login'));
export const LazyNotFound = lazy(() => import('./NotFound'));
export const LazyProduct = lazy(() => import('./Product'));
export const LazyProducts = lazy(() => import('./Products'));
export const LazyRegister = lazy(() => import('./user/Register'));
export const LazyResetPassword = lazy(() => import('./ResetPassword'));
