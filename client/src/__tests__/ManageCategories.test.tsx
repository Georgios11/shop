import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, Mock } from 'vitest';
import ManageCategories from '../pages/admin/ManageCategories';
import useCategoriesQuery from '../hooks/useCategoriesQuery';
import useDeleteCategory from '../hooks/useDeleteCategory';
import toast from 'react-hot-toast';

// Mock the hooks and toast
vi.mock('../hooks/useCategoriesQuery', () => ({
  default: vi.fn(),
}));

vi.mock('../hooks/useDeleteCategory', () => ({
  default: vi.fn(),
}));

vi.mock('react-hot-toast');

describe('ManageCategories', () => {
  const mockCategories = [
    {
      _id: '1',
      name: 'Electronics',
      is_discounted: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      createdBy: 'Admin',
      products: [{ id: 'p1' }, { id: 'p2' }],
    },
    {
      _id: '2',
      name: 'Clothing',
      is_discounted: true,
      createdAt: '2023-02-01T00:00:00.000Z',
      createdBy: 'Manager',
      products: [{ id: 'p3' }],
    },
  ];

  const mockDeleteCategory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useCategoriesQuery as Mock).mockReturnValue({
      categories: mockCategories,
      isCategoriesLoading: false,
    });

    (useDeleteCategory as Mock).mockReturnValue({
      deleteCategory: mockDeleteCategory,
      isDeleting: false,
    });
  });

  test('renders loading spinner when fetching categories', () => {
    (useCategoriesQuery as Mock).mockReturnValue({
      categories: [],
      isCategoriesLoading: true,
    });

    render(<ManageCategories />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('renders category list when loaded', () => {
    render(<ManageCategories />);

    expect(screen.getByTestId('manage-categories-page')).toBeInTheDocument();
    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
  });

  test('displays correct category information', () => {
    render(<ManageCategories />);

    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getByText('Discounted')).toBeInTheDocument();
    expect(screen.getByText('Products: 2')).toBeInTheDocument();
    expect(screen.getByText('Products: 1')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  test('handles category deletion successfully', async () => {
    const user = userEvent.setup();
    render(<ManageCategories />);

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    expect(mockDeleteCategory).toHaveBeenCalledWith('1');
    expect(toast.success).toHaveBeenCalledWith('Category deleted successfully');
  });

  test('shows error toast when deletion fails', async () => {
    const user = userEvent.setup();
    mockDeleteCategory.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Cannot delete category with products',
        },
      },
    });

    render(<ManageCategories />);

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Cannot delete category with products'
      );
    });
  });

  test('disables delete button during deletion', () => {
    (useDeleteCategory as Mock).mockReturnValue({
      deleteCategory: mockDeleteCategory,
      isDeleting: true,
    });

    render(<ManageCategories />);

    const deletingButtons = screen.getAllByText('Deleting...');
    expect(deletingButtons[0]).toBeDisabled();
  });
});
