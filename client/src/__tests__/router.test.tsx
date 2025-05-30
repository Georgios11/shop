import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from '../router';
import { vi } from 'vitest';

// Mock the useProductsCache hook
vi.mock('../hooks/useProductsCache', () => ({
  default: () => ({
    products: [
      {
        _id: '1',
        name: 'iPhone 12 Pro 256GB',
        slug: 'iphone-12-pro-256gb',
        description: 'Test description',
        price: 999.99,
        brand: 'Apple',
        category: { name: 'Electronics', id: '1' },
        image: 'test-image.jpg',
        itemsInStock: 10,
        favoritedBy: [],
      },
    ],
    isProductsLoading: false,
    isProductsFetching: false,
    isFetchingProducts: false,
  }),
}));

// Mock the query client
const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

// This test suite verifies that the router renders the correct components for each public route.
// It uses a mock QueryClient and a memory router to simulate navigation.

describe('Public Routes', () => {
  // Helper function to render the app with a memory router and query client
  const renderWithRouter = (initialEntries: string[]) => {
    const memoryRouter = createMemoryRouter(router.routes, { initialEntries });
    return render(
      <QueryClientProvider client={mockQueryClient}>
        <RouterProvider router={memoryRouter} />
      </QueryClientProvider>
    );
  };

  // Test that the home page renders on the root route
  it('renders home page', () => {
    renderWithRouter(['/']);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  // Test that the login page renders on /login
  it('renders login page', () => {
    renderWithRouter(['/login']);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  // Test that the register page renders on /register
  it('renders register page', () => {
    renderWithRouter(['/register']);
    expect(screen.getByTestId('register-page')).toBeInTheDocument();
  });

  // Test that the products page renders on /products
  it('renders products page', () => {
    renderWithRouter(['/products']);
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
  });

  // Test that the product detail page renders for a product slug
  it('renders product detail page', () => {
    renderWithRouter(['/products/iphone-12-pro-256gb']);
    expect(screen.getByTestId('product-page')).toBeInTheDocument();
  });

  // Test that the activate page renders on /activate/:token
  it('renders activate page', () => {
    renderWithRouter(['/activate/test-token']);
    expect(screen.getByTestId('activate-page')).toBeInTheDocument();
  });

  // Test that the forgot password page renders on /forgot-password
  it('renders forgot password page', () => {
    renderWithRouter(['/forgot-password']);
    expect(screen.getByTestId('forgot-password-page')).toBeInTheDocument();
  });

  // Test that the reset password page renders on /reset-password/:token
  it('renders reset password page', () => {
    renderWithRouter(['/reset-password/test-token']);
    expect(screen.getByTestId('reset-password-page')).toBeInTheDocument();
  });

  // Test that the 404 page renders for unknown routes
  it('renders 404 page for unknown routes', () => {
    renderWithRouter(['/non-existent-route']);
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });
});
