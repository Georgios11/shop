import { lazy } from 'react';

export const LazyUserDashboard = lazy(() => import('./UserDashboard'));
export const LazyUserProfile = lazy(() => import('./UserProfile'));
export const LazyOrders = lazy(() => import('./Orders'));
export const LazyFavorites = lazy(() => import('./Favorites'));
export const LazyRegister = lazy(() => import('./Register'));
// Add more as needed
