import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Products from '../pages/Products';
import useProductsCache from '../hooks/useProductsCache';
import useCurrentUser from '../hooks/useCurrentUser';
import { Product } from '../types/product';
import { CurrentUser } from '../types/user';

// Mock the hooks
vi.mock('../hooks/useProductsCache');
vi.mock('../hooks/useCurrentUser');

// Mock product data
const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Test Product 1',
    description: 'This is test product 1',
    price: 99.99,
    itemsInStock: 10,
    category: {
      id: 'cat1',
      name: 'Electronics',
    },
    image: 'test-image-1.jpg',
    imagePublicId: 'test-image-1',
    brand: 'TestBrand',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    favoritedBy: ['user1', 'user2'],
    slug: 'test-product-1',
  },
  {
    _id: '2',
    name: 'Test Product 2',
    description: 'This is test product 2',
    price: 49.99,
    itemsInStock: 5,
    category: {
      id: 'cat2',
      name: 'Clothing',
    },
    image: 'test-image-2.jpg',
    imagePublicId: 'test-image-2',
    brand: 'AnotherBrand',
    createdAt: '2023-01-02',
    updatedAt: '2023-01-02',
    favoritedBy: ['user1'],
    slug: 'test-product-2',
  },
  {
    _id: '3',
    name: 'Test Product 3',
    description: 'This is test product 3',
    price: 29.99,
    itemsInStock: 0,
    category: {
      id: 'cat1',
      name: 'Electronics',
    },
    image: 'test-image-3.jpg',
    imagePublicId: 'test-image-3',
    brand: 'TestBrand',
    createdAt: '2023-01-03',
    updatedAt: '2023-01-03',
    favoritedBy: [],
    slug: 'test-product-3',
  },
];

// Mock user data
const mockUser: CurrentUser = {
  _id: 'user1',
  name: 'Test User',
  email: 'test@example.com',
  phone: '1234567890',
  role: 'user',
  isActive: true,
  is_banned: false,
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01',
  favorites: ['1', '2'],
};

// Type for the useProductsCache return value
type ProductsCacheReturn = {
  products: Product[];
  isFetchingProducts: boolean;
  isProductsLoading: boolean;
  isProductsFetching: boolean;
};

describe('Products component', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();

    // Mock the useProductsCache hook
    vi.mocked(useProductsCache).mockReturnValue({
      products: mockProducts,
      isFetchingProducts: false,
      isProductsLoading: false,
      isProductsFetching: false,
    } as ProductsCacheReturn);

    // Mock the useCurrentUser hook
    vi.mocked(useCurrentUser).mockReturnValue(mockUser);
  });

  it('renders loading spinner when fetching products', () => {
    vi.mocked(useProductsCache).mockReturnValue({
      products: [],
      isFetchingProducts: true,
      isProductsLoading: true,
      isProductsFetching: true,
    } as ProductsCacheReturn);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders all products when no filters are applied', () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    expect(screen.getByTestId('products-page')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /test product/i })).toHaveLength(
      3
    );
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('Test Product 3')).toBeInTheDocument();
  });

  it('renders category filters correctly', () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // Check if category filters are rendered
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
  });

  it('filters products by category when category filter is clicked', () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // Click on Electronics category
    fireEvent.click(screen.getByText('Electronics'));

    // Should show only Electronics products
    expect(screen.getAllByRole('link', { name: /test product/i })).toHaveLength(
      2
    );
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 3')).toBeInTheDocument();
    expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument();

    // Clear filter button should be visible
    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('clears filters when clear filters button is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/?category=Electronics']}>
        <Products />
      </MemoryRouter>
    );

    // Click on Clear filters
    fireEvent.click(screen.getByText('Clear filters'));

    // Should show all products again
    expect(screen.getAllByRole('link', { name: /test product/i })).toHaveLength(
      3
    );
  });

  it('filters products by search term', () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // Enter search term
    fireEvent.change(screen.getByPlaceholderText('Search products...'), {
      target: { value: 'product 2' },
    });

    // Should only show Product 2
    expect(screen.getAllByRole('link', { name: /test product/i })).toHaveLength(
      1
    );
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Product 3')).not.toBeInTheDocument();
  });

  it('filters products by brand name', () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // Enter brand name as search term
    fireEvent.change(screen.getByPlaceholderText('Search products...'), {
      target: { value: 'anotherbrand' },
    });

    // Should only show AnotherBrand products
    expect(screen.getAllByRole('link', { name: /test product/i })).toHaveLength(
      1
    );
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Product 3')).not.toBeInTheDocument();
  });

  it('displays favorite icon for products in user favorites', () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // Products 1 and 2 are in favorites
    const products = screen.getAllByRole('link', { name: /test product/i });

    // Check for favorite class on products
    expect(products[0].querySelector('.favorite')).not.toBeNull();
    expect(products[1].querySelector('.favorite')).not.toBeNull();
    expect(products[2].querySelector('.favorite')).toBeNull();
  });

  it('displays out of stock message for products with zero stock', () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    expect(screen.getByText('10 in stock')).toBeInTheDocument();
    expect(screen.getByText('5 in stock')).toBeInTheDocument();
  });

  it('displays likes count for products with favorites', () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    expect(screen.getByText('2 users like this product')).toBeInTheDocument();
    expect(screen.getByText('1 user likes this product')).toBeInTheDocument();
  });

  it('works correctly when user is not logged in', () => {
    // Mock no user logged in
    vi.mocked(useCurrentUser).mockReturnValue(null);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // Should still render products but without favorite icons
    expect(screen.getAllByRole('link', { name: /test product/i })).toHaveLength(
      3
    );
    expect(screen.queryAllByTestId('favorite-icon')).toHaveLength(0);
  });

  it('combines category filter with search term', () => {
    render(
      <MemoryRouter initialEntries={['/?category=Electronics']}>
        <Products />
      </MemoryRouter>
    );

    // Filter by Electronics category first
    expect(screen.getAllByRole('link', { name: /test product/i })).toHaveLength(
      2
    );

    // Then add search term
    fireEvent.change(screen.getByPlaceholderText('Search products...'), {
      target: { value: 'product 1' },
    });

    // Should only show Product 1 from Electronics category
    expect(screen.getAllByRole('link', { name: /test product/i })).toHaveLength(
      1
    );
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Product 3')).not.toBeInTheDocument();
  });
});
