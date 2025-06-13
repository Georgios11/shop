import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ManageUsers from '../pages/admin/ManageUsers';
import useUsersQuery from '../hooks/useUsersQuery';
import { useDeleteUser } from '../hooks/useDeleteUser';
import { useBanUser } from '../hooks/useBanUser';
import { useUnbanUser } from '../hooks/useUnbanUser';
import { useChangeUserStatus } from '../hooks/useChangeUserStatus';
import toast from 'react-hot-toast';

// Mock the hooks
vi.mock('../hooks/useUsersQuery');
vi.mock('../hooks/useDeleteUser');
vi.mock('../hooks/useBanUser');
vi.mock('../hooks/useUnbanUser');
vi.mock('../hooks/useChangeUserStatus');
vi.mock('react-hot-toast');

const mockUsers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    role: 'user',
    is_banned: false,
    image: 'john.jpg',
    isActive: true,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '098-765-4321',
    role: 'admin',
    is_banned: true,
    image: 'jane.jpg',
    isActive: false,
    createdAt: '2023-01-02',
    updatedAt: '2023-01-02',
  },
];

describe('ManageUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(useUsersQuery).mockReturnValue({
      data: mockUsers,
      isUsersLoading: false,
      isUsersFetching: false,
      error: null,
    });

    vi.mocked(useDeleteUser).mockReturnValue({
      deleteUser: vi.fn().mockResolvedValue({ message: 'User deleted' }),
      isDeleting: false,
    });

    vi.mocked(useBanUser).mockReturnValue({
      banUser: vi.fn().mockResolvedValue({ message: 'User banned' }),
      isLoading: false,
    });

    vi.mocked(useUnbanUser).mockReturnValue({
      unbanUser: vi.fn().mockResolvedValue({ message: 'User unbanned' }),
      isLoading: false,
    });

    vi.mocked(useChangeUserStatus).mockReturnValue({
      changeUserStatus: vi
        .fn()
        .mockResolvedValue({ message: 'Status changed' }),
      isLoading: false,
    });
  });

  it('should render loading spinner when loading', () => {
    vi.mocked(useUsersQuery).mockReturnValue({
      data: [],
      isUsersLoading: true,
      isUsersFetching: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should render the user list', () => {
    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    expect(screen.getByTestId('manage-users-page')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('ID: 1')).toBeInTheDocument();
    expect(screen.getByText('ID: 2')).toBeInTheDocument();
  });

  it('should filter users by role', () => {
    render(
      <MemoryRouter initialEntries={['?role=admin']}>
        <ManageUsers />
      </MemoryRouter>
    );

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should show action buttons when edit button is clicked', () => {
    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    const editButtons = screen
      .getAllByRole('button', { name: '' })
      .filter((button) => button.classList.contains('update'));

    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Promote')).toBeInTheDocument();
    expect(screen.getByText('Ban')).toBeInTheDocument();
  });

  it('should handle delete confirmation', async () => {
    const deleteUserMock = vi
      .fn()
      .mockResolvedValue({ message: 'User deleted' });
    vi.mocked(useDeleteUser).mockReturnValue({
      deleteUser: deleteUserMock,
      isDeleting: false,
    });

    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    const deleteButtons = screen
      .getAllByRole('button', { name: '' })
      .filter((button) => button.classList.contains('delete'));

    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(deleteUserMock).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('User deleted');
    });
  });

  it('should handle user promotion', async () => {
    const changeStatusMock = vi
      .fn()
      .mockResolvedValue({ message: 'User promoted' });
    vi.mocked(useChangeUserStatus).mockReturnValue({
      changeUserStatus: changeStatusMock,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    // First click edit button
    const editButtons = screen
      .getAllByRole('button', { name: '' })
      .filter((button) => button.classList.contains('update'));
    fireEvent.click(editButtons[0]);

    // Then click promote
    fireEvent.click(screen.getByText('Promote'));

    await waitFor(() => {
      expect(changeStatusMock).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('User promoted');
    });
  });

  it('should handle ban/unban user', async () => {
    const banUserMock = vi.fn().mockResolvedValue({ message: 'User banned' });
    vi.mocked(useBanUser).mockReturnValue({
      banUser: banUserMock,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    // First click edit button for non-banned user
    const editButtons = screen
      .getAllByRole('button', { name: '' })
      .filter((button) => button.classList.contains('update'));
    fireEvent.click(editButtons[0]);

    // Then click ban
    fireEvent.click(screen.getByText('Ban'));

    await waitFor(() => {
      expect(banUserMock).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('User banned');
    });
  });
});
