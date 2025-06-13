import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SingleProductAdmin from '../pages/admin/SingleProductAdmin';
import { MemoryRouter } from 'react-router-dom';
import useProductsCache from '../hooks/useProductsCache';
import useDeleteProduct from '../hooks/useDeleteProduct';
import useUpdateProduct from '../hooks/useUpdateProduct';
import toast from 'react-hot-toast';
import * as router from 'react-router-dom';

// Mock hooks and dependencies
vi.mock('../hooks/useProductsCache');
vi.mock('../hooks/useDeleteProduct');
vi.mock('../hooks/useUpdateProduct');
vi.mock('react-hot-toast');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ productId: 'test-id' }),
    useLocation: () => ({ state: { filter: 'test-category' } }),
    useNavigate: () => vi.fn(),
  };
});

const mockProduct = {
  _id: 'test-id',
  name: 'Test Product',
  brand: 'Test Brand',
  description: 'This is a test product',
  price: 99.99,
  itemsInStock: 10,
  category: {
    id: 'category-id',
    name: 'Test Category',
  },
  image: 'test-image.jpg',
  favoritedBy: ['user1', 'user2'],
  imagePublicId: 'test-public-id',
  createdAt: '2023-01-01',
  updatedAt: '2023-01-02',
  slug: 'test-product',
};

describe('SingleProductAdmin', () => {
  let updateProductMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    updateProductMock = vi
      .fn()
      .mockResolvedValue({ message: 'Product updated' });

    // Mock hook implementations
    vi.mocked(useProductsCache).mockReturnValue({
      products: [mockProduct],
      isProductsLoading: false,
      isProductsFetching: false,
      isFetchingProducts: false,
    });

    vi.mocked(useDeleteProduct).mockReturnValue({
      deleteProduct: vi.fn().mockResolvedValue({ message: 'Product deleted' }),
      isDeleting: false,
    });

    vi.mocked(useUpdateProduct).mockReturnValue({
      updateProduct: updateProductMock,
      isUpdating: false,
    });
  });

  it('renders product details correctly', () => {
    render(
      <MemoryRouter>
        <SingleProductAdmin />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Brand: Test Brand')).toBeInTheDocument();
    expect(screen.getByText('This is a test product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('10 in stock')).toBeInTheDocument();
    expect(screen.getByText('Category: Test Category')).toBeInTheDocument();
    expect(screen.getByText('❤️ 2 likes')).toBeInTheDocument();
  });

  it('shows edit form when edit button is clicked', () => {
    render(
      <MemoryRouter>
        <SingleProductAdmin />
      </MemoryRouter>
    );

    // Get the button directly by its class
    const editButton = document.querySelector('button.update');
    fireEvent.click(editButton!);

    // Check if form elements appear
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stock/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
  });

  it('shows delete confirmation when delete button is clicked', () => {
    render(
      <MemoryRouter>
        <SingleProductAdmin />
      </MemoryRouter>
    );

    // Get the button directly by its class
    const deleteButton = document.querySelector('button.delete');
    fireEvent.click(deleteButton!);

    expect(
      screen.getByText(/are you sure you want to delete this product/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('updates product successfully', async () => {
    render(
      <MemoryRouter>
        <SingleProductAdmin />
      </MemoryRouter>
    );

    // Open edit form with correct selection
    const editButton = document.querySelector('button.update');
    fireEvent.click(editButton!);

    // Fill form
    const priceInput = screen.getByLabelText(/price/i);
    fireEvent.change(priceInput, { target: { value: '199.99' } });

    const stockInput = screen.getByLabelText(/stock/i);
    fireEvent.change(stockInput, { target: { value: '20' } });

    // Submit form
    const updateButton = screen.getByRole('button', { name: /update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(updateProductMock).toHaveBeenCalledWith({
        price: 199.99,
        itemsInStock: 20,
      });
      expect(toast.success).toHaveBeenCalledWith('Product updated');
    });
  });

  it('deletes product successfully', async () => {
    render(
      <MemoryRouter>
        <SingleProductAdmin />
      </MemoryRouter>
    );

    // Open delete modal
    const deleteButton = document.querySelector('button.delete');
    fireEvent.click(deleteButton!);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(useDeleteProduct().deleteProduct).toHaveBeenCalledWith('test-id');
      expect(toast.success).toHaveBeenCalledWith('Product deleted');
    });
  });

  it('handles navigation when product is not found', () => {
    vi.mocked(useProductsCache).mockReturnValue({
      products: [],
      isProductsLoading: false,
      isProductsFetching: false,
      isFetchingProducts: false,
    });

    const navigateMock = vi.fn();
    vi.spyOn(router, 'useNavigate').mockReturnValue(navigateMock);

    render(
      <MemoryRouter>
        <SingleProductAdmin />
      </MemoryRouter>
    );

    expect(navigateMock).toHaveBeenCalledWith(
      '/admin/products?category=test-category'
    );
  });
});
