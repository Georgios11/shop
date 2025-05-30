import { createBrowserRouter, RouteObject } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/user/Register';
import Products from './pages/Products';
import Product from './pages/Product';
import UserDashboard from './pages/user/UserDashboard';
import Orders from './pages/user/Orders';
import Favorites from './pages/user/Favorites';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageProducts from './pages/admin/ManageProducts';
import ManageCategories from './pages/admin/ManageCategories';
import NotFound from './pages/NotFound';
import Checkout from './pages/Checkout';
import UserProfile from './pages/user/UserProfile';
import Activate from './pages/Activate';
import Forbidden from './pages/Forbidden';
import Protected from './components/Protected';
import SingleProductAdmin from './pages/admin/SingleProductAdmin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import CreateProduct from './pages/admin/CreateProduct';
import ManageOrders from './pages/admin/ManageOrders';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // Public Routes
      { index: true, element: <Home /> }, // Default route ("/")
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:slug', element: <Product /> },
      { path: 'activate/:token', element: <Activate /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password/:token', element: <ResetPassword /> },

      // User Routes (Protected)
      {
        path: 'user',
        element: <Protected allowedRoles={['user', 'admin']} />,
        children: [
          {
            path: '',
            element: <UserDashboard />,
            children: [
              {
                index: true,
                element: <UserProfile />,
              },
              {
                path: 'profile',
                element: <UserProfile />,
              },
              {
                path: 'orders',
                element: <Orders />,
              },
              {
                path: 'favorites',
                element: <Favorites />,
              },
            ],
          },
        ],
      },

      // Admin Routes (Protected)
      {
        path: 'admin',
        element: <Protected allowedRoles={['admin']} />,
        children: [
          {
            path: '',
            element: <AdminDashboard />,
            children: [
              {
                index: true,
                element: <UserProfile />,
              },
              {
                path: 'users',
                element: <ManageUsers />,
              },
              {
                path: 'products',
                element: <ManageProducts />,
              },
              {
                path: 'products/add',
                element: <CreateProduct />,
              },
              {
                path: 'products/:productId',
                element: <SingleProductAdmin />,
              },
              {
                path: 'categories',
                element: <ManageCategories />,
              },
              {
                path: 'orders',
                element: <ManageOrders />,
              },
            ],
          },
        ],
      },
      // Guest/User Routes
      {
        path: 'cart',
        children: [
          { index: true, element: <Cart /> },
          { path: 'checkout', element: <Checkout /> },
        ],
      },
      // Forbidden Route
      {
        path: 'forbidden',
        element: <Forbidden />,
      },
      // Fallback Route
      { path: '*', element: <NotFound /> }, // 404 Page
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
