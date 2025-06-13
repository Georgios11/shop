import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainNav from '../components/MainNav';
import useWindowWidth from '../hooks/useWindowWidth';
import useCurrentUser from '../hooks/useCurrentUser';
import useLogout from '../hooks/useLogout';
import type { CurrentUser } from '../types/user';

// Mock custom hooks
vi.mock('../hooks/useWindowWidth');
vi.mock('../hooks/useCurrentUser');
vi.mock('../hooks/useLogout');

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MainNav component', () => {
  const useWindowWidthMock = vi.mocked(useWindowWidth);
  const useCurrentUserMock = vi.mocked(useCurrentUser);
  const useLogoutMock = vi.mocked(useLogout);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation links', () => {
    useWindowWidthMock.mockReturnValue(1024);
    useCurrentUserMock.mockReturnValue(null);

    renderWithRouter(<MainNav />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders login and register links when user is not logged in', () => {
    useWindowWidthMock.mockReturnValue(1024);
    useCurrentUserMock.mockReturnValue(null);

    renderWithRouter(<MainNav />);

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-icon')).not.toBeInTheDocument();
  });

  it('renders logout button and cart when user is logged in', () => {
    useWindowWidthMock.mockReturnValue(1024);
    useCurrentUserMock.mockReturnValue({
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
      phone: '123456789',
      role: 'user',
      favorites: [],
      cart: {
        items: [
          { productId: '1', quantity: 2 },
          { productId: '2', quantity: 1 },
        ],
      },
    } as unknown as CurrentUser);

    renderWithRouter(<MainNav />);

    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
    expect(screen.getByText('(3)')).toBeInTheDocument(); // Total items in cart
  });

  it('toggles mobile menu when menu button is clicked on small screens', () => {
    useWindowWidthMock.mockReturnValue(768);
    useCurrentUserMock.mockReturnValue(null);

    renderWithRouter(<MainNav />);

    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();

    // Menu should be closed initially
    expect(screen.queryByText('Home')).not.toBeVisible();

    // Open menu
    fireEvent.click(menuButton);
    expect(screen.getByText('Home')).toBeVisible();

    // Close menu
    fireEvent.click(menuButton);
    expect(screen.queryByText('Home')).not.toBeVisible();
  });

  it('calls logout function when logout button is clicked', () => {
    useWindowWidthMock.mockReturnValue(1024);
    useCurrentUserMock.mockReturnValue({
      id: '1',
      name: 'Test User',
      favorites: [],
      cart: undefined,
    } as unknown as CurrentUser);
    const logoutFn = vi.fn();
    useLogoutMock.mockReturnValue(logoutFn);

    renderWithRouter(<MainNav />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(logoutFn).toHaveBeenCalledTimes(1);
  });
});
