import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserProfile from '../pages/user/UserProfile';
import useCurrentUser from '../hooks/useCurrentUser';
import { useDeleteAccount } from '../hooks/useDeleteAccount';
import useUpdateUser from '../hooks/useUpdateUser';
import toast from 'react-hot-toast';
import { CurrentUser } from '../types/user';

// Mock the hooks and toast
vi.mock('../hooks/useCurrentUser');
vi.mock('../hooks/useDeleteAccount');
vi.mock('../hooks/useUpdateUser');
vi.mock('react-hot-toast');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockCurrentUser: CurrentUser = {
  _id: '1',
  name: 'Test User',
  email: 'test@example.com',
  phone: '123456789',
  role: 'user',
  isActive: true,
  is_banned: false,
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01',
  image: 'https://example.com/image.jpg',
  favorites: [],
};

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('UserProfile component', () => {
  const useCurrentUserMock = vi.mocked(useCurrentUser);
  const useDeleteAccountMock = vi.mocked(useDeleteAccount);
  const useUpdateUserMock = vi.mocked(useUpdateUser);
  const toastMock = vi.mocked(toast);

  const mockDeleteAccount = vi.fn();
  const mockUpdateUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useCurrentUserMock.mockReturnValue(mockCurrentUser);

    useDeleteAccountMock.mockReturnValue({
      deleteAccount: mockDeleteAccount,
      isLoading: false,
    });

    useUpdateUserMock.mockReturnValue({
      updateUser: mockUpdateUser,
      isUpdating: false,
    });
  });

  it('renders user profile when user is logged in', () => {
    renderWithRouter(<UserProfile />);

    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Phone:')).toBeInTheDocument();
    expect(screen.getByText('123456789')).toBeInTheDocument();
  });

  it('displays default avatar when user has no image', () => {
    useCurrentUserMock.mockReturnValue({
      ...mockCurrentUser,
      image: undefined,
    });

    renderWithRouter(<UserProfile />);

    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of name as avatar
  });

  it('displays "Not provided" when phone is missing', () => {
    useCurrentUserMock.mockReturnValue({
      ...mockCurrentUser,
      phone: '',
    });

    renderWithRouter(<UserProfile />);

    expect(screen.getByText('Not provided')).toBeInTheDocument();
  });

  it('shows "User Profile Not Found" when user is not logged in', () => {
    useCurrentUserMock.mockReturnValue(null);

    renderWithRouter(<UserProfile />);

    expect(screen.getByText('User Profile Not Found')).toBeInTheDocument();
  });

  it('opens delete confirmation modal when delete button is clicked', () => {
    const { container } = renderWithRouter(<UserProfile />);

    // Find delete button by class
    const deleteButton = container.querySelector('.sc-dTdQuR');
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton as Element);

    expect(screen.getByText('Delete Account')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to delete this account?')
    ).toBeInTheDocument();
    expect(
      screen.getByText('This action cannot be undone.')
    ).toBeInTheDocument();
  });

  it('calls deleteAccount when delete is confirmed', async () => {
    mockDeleteAccount.mockResolvedValue({
      message: 'Account deleted successfully',
    });

    const { container } = renderWithRouter(<UserProfile />);

    // Open delete confirmation
    const deleteButton = container.querySelector('.sc-dTdQuR');
    fireEvent.click(deleteButton as Element);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalledTimes(1);
      expect(toastMock.success).toHaveBeenCalledWith(
        'Account deleted successfully'
      );
    });
  });

  it('shows error toast when delete account fails', async () => {
    const error = new Error('Failed to delete account');
    mockDeleteAccount.mockRejectedValue(error);

    const { container } = renderWithRouter(<UserProfile />);

    // Open delete confirmation
    const deleteButton = container.querySelector('.sc-dTdQuR');
    fireEvent.click(deleteButton as Element);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalledTimes(1);
      expect(toastMock.error).toHaveBeenCalledWith('Failed to delete account');
    });
  });

  it('opens edit form when edit button is clicked', () => {
    const { container } = renderWithRouter(<UserProfile />);

    // Find edit button by class
    const editButton = container.querySelector('.sc-llIIlC');
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton as Element);

    expect(screen.getByLabelText('Old Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Profile Image')).toBeInTheDocument();
  });

  it('calls updateUser when edit form is submitted', async () => {
    mockUpdateUser.mockResolvedValue({
      message: 'Profile updated successfully',
    });

    const { container } = renderWithRouter(<UserProfile />);

    // Open edit form
    const editButton = container.querySelector('.sc-llIIlC');
    fireEvent.click(editButton as Element);

    // Fill and submit form
    const phoneInput = screen.getByLabelText('Phone');
    fireEvent.change(phoneInput, { target: { value: '987654321' } });

    const submitButton = screen.getByRole('button', { name: 'Update' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalled();
      expect(toastMock.success).toHaveBeenCalledWith(
        'Profile updated successfully'
      );
    });
  });

  it('shows error toast when update user fails', async () => {
    const error = new Error('Failed to update profile');
    mockUpdateUser.mockRejectedValue(error);

    const { container } = renderWithRouter(<UserProfile />);

    // Open edit form
    const editButton = container.querySelector('.sc-llIIlC');
    fireEvent.click(editButton as Element);

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Update' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalled();
      expect(toastMock.error).toHaveBeenCalledWith('Failed to update profile');
    });
  });

  it('closes edit form when cancel button is clicked', () => {
    const { container } = renderWithRouter(<UserProfile />);

    // Open edit form
    const editButton = container.querySelector('.sc-llIIlC');
    fireEvent.click(editButton as Element);

    expect(screen.getByLabelText('Phone')).toBeInTheDocument();

    // Cancel edit
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(screen.queryByLabelText('Phone')).not.toBeInTheDocument();
  });
});
