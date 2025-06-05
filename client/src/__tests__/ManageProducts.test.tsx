import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ManageProducts from '../pages/admin/ManageProducts';
import useProductsCache from '../hooks/useProductsCache';

// Mock the custom hook
vi.mock('../hooks/useProductsCache', () => ({
  default: vi.fn(),
}));

// Mock components
vi.mock('../../components/Image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="mock-image" />
  ),
}));

vi.mock('../../ui/Spinner', () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}));

describe('ManageProducts', () => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Product 1',
      brand: 'Brand 1',
      price: 100,
      description: 'Description for product 1',
      itemsInStock: 10,
      category: { name: 'Category 1' },
      image: 'image1.jpg',
      favoritedBy: ['user1', 'user2'],
    },
    {
      _id: '2',
      name: 'Product 2',
      brand: 'Brand 2',
      price: 200,
      description: 'Description for product 2',
      itemsInStock: 0,
      category: { name: 'Category 2' },
      image: 'image2.jpg',
      favoritedBy: [],
    },
    {
      _id: '3',
      name: 'Product 3',
      brand: 'Brand 3',
      price: 300,
      description: 'Description for product 3',
      itemsInStock: 5,
      category: { name: 'Category 1' },
      image: 'image3.jpg',
      favoritedBy: ['user1'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render spinner when products are being fetched', () => {
    (useProductsCache as Mock).mockReturnValue({
      products: [],
      isProductsFetching: true,
    });

    render(
      <MemoryRouter>
        <ManageProducts />
      </MemoryRouter>
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should render products when fetch is complete', () => {
    (useProductsCache as Mock).mockReturnValue({
      products: mockProducts,
      isProductsFetching: false,
    });

    render(
      <MemoryRouter>
        <ManageProducts />
      </MemoryRouter>
    );

    expect(screen.getByTestId('manage-products-page')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('Product 3')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
    expect(screen.getByText('$300')).toBeInTheDocument();
  });

  it('should display out of stock message for products with zero inventory', () => {
    (useProductsCache as Mock).mockReturnValue({
      products: mockProducts,
      isProductsFetching: false,
    });

    render(
      <MemoryRouter>
        <ManageProducts />
      </MemoryRouter>
    );

    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    expect(screen.getByText('10 in stock')).toBeInTheDocument();
  });

  it('should show correct number of likes', () => {
    (useProductsCache as Mock).mockReturnValue({
      products: mockProducts,
      isProductsFetching: false,
    });

    render(
      <MemoryRouter>
        <ManageProducts />
      </MemoryRouter>
    );

    expect(screen.getByText('❤️ 2 likes')).toBeInTheDocument();
    expect(screen.getByText('❤️ 1 like')).toBeInTheDocument();
  });

  it('should filter products by category when a category is selected', () => {
    (useProductsCache as Mock).mockReturnValue({
      products: mockProducts,
      isProductsFetching: false,
    });

    render(
      <MemoryRouter initialEntries={['?category=Category%201']}>
        <ManageProducts />
      </MemoryRouter>
    );

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 3')).toBeInTheDocument();
    expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
  });

  it('should display category filters', () => {
    (useProductsCache as Mock).mockReturnValue({
      products: mockProducts,
      isProductsFetching: false,
    });

    render(
      <MemoryRouter>
        <ManageProducts />
      </MemoryRouter>
    );

    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('Category 2')).toBeInTheDocument();
  });

  it('should display clear filters link when a category is selected', () => {
    (useProductsCache as Mock).mockReturnValue({
      products: mockProducts,
      isProductsFetching: false,
    });

    render(
      <MemoryRouter initialEntries={['?category=Category%201']}>
        <ManageProducts />
      </MemoryRouter>
    );

    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('should not display clear filters link when no category is selected', () => {
    (useProductsCache as Mock).mockReturnValue({
      products: mockProducts,
      isProductsFetching: false,
    });

    render(
      <MemoryRouter>
        <ManageProducts />
      </MemoryRouter>
    );

    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });
});
