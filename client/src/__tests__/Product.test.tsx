import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SingleProduct from '../pages/Product';
import toast from 'react-hot-toast';

// Mock functions for hooks
const mockAddToCart = vi.fn();
const mockAddFavorite = vi.fn();
const mockRemoveFavorite = vi.fn();
let mockUserFavorites = ['product456'];

// Mock the hooks
vi.mock('../hooks/useProductsCache', () => ({
  default: () => ({
    products: [
      {
        _id: 'product123',
        name: 'Test Product',
        slug: 'test-product',
        brand: 'Test Brand',
        description: 'This is a test product',
        price: 99.99,
        itemsInStock: 10,
        image: 'test-image.jpg',
        favoritedBy: ['user456'],
      },
      {
        _id: 'product456',
        name: 'Out of Stock Product',
        slug: 'out-of-stock-product',
        brand: 'Test Brand',
        description: 'This product is out of stock',
        price: 49.99,
        itemsInStock: 0,
        image: 'out-of-stock.jpg',
        favoritedBy: [],
      },
    ],
    isProductsLoading: false,
    isProductsFetching: false,
  }),
}));

vi.mock('../hooks/useCurrentUser', () => ({
  default: () => ({
    _id: 'user123',
    favorites: mockUserFavorites,
  }),
}));

vi.mock('../hooks/useAddFavorite', () => ({
  default: () => ({
    addFavorite: mockAddFavorite,
    isAddingFavorite: false,
  }),
}));

vi.mock('../hooks/useRemoveFavorite', () => ({
  default: () => ({
    removeFavorite: mockRemoveFavorite,
    isRemovingFavorite: false,
  }),
}));

vi.mock('../hooks/useAddToCart', () => ({
  default: () => ({
    addToCart: mockAddToCart,
    isAddingToCart: false,
  }),
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SingleProduct Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.clearAllMocks();

    // Reset mock implementations
    mockAddToCart.mockResolvedValue({ message: 'Added to cart' });
    mockAddFavorite.mockResolvedValue({ message: 'Added to favorites' });
    mockRemoveFavorite.mockResolvedValue({ message: 'Removed from favorites' });
    mockUserFavorites = ['product456']; // Reset to default
  });

  it('renders product details correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/products/test-product']}>
          <Routes>
            <Route path="/products/:slug" element={<SingleProduct />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Brand: Test Brand')).toBeInTheDocument();
    expect(screen.getByText('This is a test product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('10 in stock')).toBeInTheDocument();
  });

  it('displays out of stock message when product has no stock', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/products/out-of-stock-product']}>
          <Routes>
            <Route path="/products/:slug" element={<SingleProduct />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Out of Stock Product')).toBeInTheDocument();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('shows favorite count when product has favorites', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/products/test-product']}>
          <Routes>
            <Route path="/products/:slug" element={<SingleProduct />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('❤️ 1 like')).toBeInTheDocument();
  });

  it('shows back link with correct text', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/products/test-product']}>
          <Routes>
            <Route path="/products/:slug" element={<SingleProduct />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('back to all products')).toBeInTheDocument();
  });

  it('shows back link with category filter when provided', () => {
    // Manually set the location state with filter
    const locationState = { filter: 'electronics' };

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            { pathname: '/products/test-product', state: locationState },
          ]}
        >
          <Routes>
            <Route path="/products/:slug" element={<SingleProduct />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(
      screen.getByText('back to electronics products')
    ).toBeInTheDocument();
  });

  it('handles add to cart action', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/products/test-product']}>
          <Routes>
            <Route path="/products/:slug" element={<SingleProduct />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const addToCartButton = screen.getAllByRole('button')[0]; // First button is add to cart
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith('product123');
      expect(toast.success).toHaveBeenCalledWith('Added to cart');
    });
  });

  it('handles toggle favorite action (add)', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/products/test-product']}>
          <Routes>
            <Route path="/products/:slug" element={<SingleProduct />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const favoriteButton = screen.getAllByRole('button')[1]; // Second button is favorite
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(mockAddFavorite).toHaveBeenCalledWith('product123');
      expect(toast.success).toHaveBeenCalledWith('Added to favorites');
    });
  });

  it('handles toggle favorite action (remove)', async () => {
    // Override the useCurrentUser mock for this test to make the product favorited
    mockUserFavorites = ['product123']; // Make this product favorited

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/products/test-product']}>
          <Routes>
            <Route path="/products/:slug" element={<SingleProduct />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const favoriteButton = screen.getAllByRole('button')[1]; // Second button is favorite
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(mockRemoveFavorite).toHaveBeenCalledWith('product123');
      expect(toast.success).toHaveBeenCalledWith('Removed from favorites');
    });
  });

  it('handles error when adding to cart', async () => {
    // Override the addToCart implementation for this test
    mockAddToCart.mockRejectedValueOnce(new Error('Failed to add to cart'));

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/products/test-product']}>
          <Routes>
            <Route path="/products/:slug" element={<SingleProduct />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const addToCartButton = screen.getAllByRole('button')[0];
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to add to cart');
    });
  });

  it('displays product not found message when product does not exist', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/products/non-existent-product']}>
          <Routes>
            <Route path="/products/:slug" element={<SingleProduct />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Product not found')).toBeInTheDocument();
  });
});
