import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Favorites from '../pages/user/Favorites';
import useCurrentUser from '../hooks/useCurrentUser';
import useProductsCache from '../hooks/useProductsCache';
import useRemoveFavorite from '../hooks/useRemoveFavorite';
import { toast } from 'react-hot-toast';
import { Product } from '../types/product';

// Mock the hooks
vi.mock('../hooks/useCurrentUser');
vi.mock('../hooks/useProductsCache');
vi.mock('../hooks/useRemoveFavorite');
vi.mock('react-hot-toast');

// Custom error type with response property
interface ApiError extends Error {
  response?: { data?: { message?: string } };
}

describe('Favorites Component', () => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Product 1',
      price: 10,
      image: 'image1.jpg',
      itemsInStock: 5,
      description: 'Test description',
      category: { id: 'cat1', name: 'Test category' },
      imagePublicId: 'test-id-1',
      brand: 'Test brand',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slug: 'product-1',
    },
    {
      _id: '2',
      name: 'Product 2',
      price: 20,
      image: 'image2.jpg',
      itemsInStock: 0,
      description: 'Test description',
      category: { id: 'cat1', name: 'Test category' },
      imagePublicId: 'test-id-2',
      brand: 'Test brand',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slug: 'product-2',
    },
    {
      _id: '3',
      name: 'Product 3',
      price: 30,
      image: 'image3.jpg',
      itemsInStock: 10,
      description: 'Test description',
      category: { id: 'cat1', name: 'Test category' },
      imagePublicId: 'test-id-3',
      brand: 'Test brand',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slug: 'product-3',
    },
  ] as Product[];

  const mockUser = {
    _id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    address: '123 Test St',
    role: 'user',
    isAdmin: false,
    isVerified: true,
    isActive: true,
    is_banned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favorites: ['1', '2'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('displays loading when products are loading', () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      ...mockUser,
      favorites: ['1', '2'],
    });
    vi.mocked(useProductsCache).mockReturnValue({
      products: [],
      isProductsLoading: true,
      isProductsFetching: false,
      isFetchingProducts: false,
    });
    vi.mocked(useRemoveFavorite).mockReturnValue({
      removeFavorite: vi.fn(),
      isRemovingFavorite: false,
    });

    render(<Favorites />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays favorite products when loaded', () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      ...mockUser,
      favorites: ['1', '3'],
    });
    vi.mocked(useProductsCache).mockReturnValue({
      products: mockProducts,
      isProductsLoading: false,
      isProductsFetching: false,
      isFetchingProducts: false,
    });
    vi.mocked(useRemoveFavorite).mockReturnValue({
      removeFavorite: vi.fn(),
      isRemovingFavorite: false,
    });

    render(<Favorites />);

    expect(screen.getByTestId('user-favorites-page')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 3')).toBeInTheDocument();
    expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
  });

  test('displays message when no favorites exist', () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      ...mockUser,
      favorites: [],
    });
    vi.mocked(useProductsCache).mockReturnValue({
      products: mockProducts,
      isProductsLoading: false,
      isProductsFetching: false,
      isFetchingProducts: false,
    });
    vi.mocked(useRemoveFavorite).mockReturnValue({
      removeFavorite: vi.fn(),
      isRemovingFavorite: false,
    });

    render(<Favorites />);

    expect(
      screen.getByText('No favorites yet! Browse products to add some.')
    ).toBeInTheDocument();
  });

  test('removes a favorite when trash icon is clicked', async () => {
    const user = userEvent.setup();
    const mockRemoveFavorite = vi
      .fn()
      .mockResolvedValue({ message: 'Product removed from favorites' });

    vi.mocked(useCurrentUser).mockReturnValue({
      ...mockUser,
      favorites: ['1'],
    });
    vi.mocked(useProductsCache).mockReturnValue({
      products: mockProducts,
      isProductsLoading: false,
      isProductsFetching: false,
      isFetchingProducts: false,
    });
    vi.mocked(useRemoveFavorite).mockReturnValue({
      removeFavorite: mockRemoveFavorite,
      isRemovingFavorite: false,
    });

    render(<Favorites />);

    const trashButton = screen.getAllByRole('button')[0];
    await user.click(trashButton);

    expect(mockRemoveFavorite).toHaveBeenCalledWith('1');
    expect(toast.success).toHaveBeenCalledWith(
      'Product removed from favorites'
    );
  });

  test('shows error toast when removing favorite fails', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Failed') as ApiError;
    mockError.response = { data: { message: 'Error removing favorite' } };

    const mockRemoveFavorite = vi.fn().mockRejectedValue(mockError);

    vi.mocked(useCurrentUser).mockReturnValue({
      ...mockUser,
      favorites: ['1'],
    });
    vi.mocked(useProductsCache).mockReturnValue({
      products: mockProducts,
      isProductsLoading: false,
      isProductsFetching: false,
      isFetchingProducts: false,
    });
    vi.mocked(useRemoveFavorite).mockReturnValue({
      removeFavorite: mockRemoveFavorite,
      isRemovingFavorite: false,
    });

    render(<Favorites />);

    const trashButton = screen.getAllByRole('button')[0];
    await user.click(trashButton);

    expect(mockRemoveFavorite).toHaveBeenCalledWith('1');
    expect(toast.error).toHaveBeenCalledWith('Error removing favorite');
  });

  test('disables trash button while removing favorite', () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      ...mockUser,
      favorites: ['1'],
    });
    vi.mocked(useProductsCache).mockReturnValue({
      products: mockProducts,
      isProductsLoading: false,
      isProductsFetching: false,
      isFetchingProducts: false,
    });
    vi.mocked(useRemoveFavorite).mockReturnValue({
      removeFavorite: vi.fn(),
      isRemovingFavorite: true,
    });

    render(<Favorites />);

    const trashButton = screen.getAllByRole('button')[0];
    expect(trashButton).toBeDisabled();
  });
});
