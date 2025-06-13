import { describe, it, vi, beforeEach, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Protected from '../components/Protected';
import { BrowserRouter } from 'react-router-dom';
import * as useCurrentUserModule from '../hooks/useCurrentUser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as reactRouterDom from 'react-router-dom';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Outlet: () => <div data-testid="outlet">Protected Content</div>,
  };
});

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('Protected Component', () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockUser = (role: string) => ({
    role,
    favorites: [],
    _id: '123',
    name: 'Test User',
    email: 'test@example.com',
    phone: '123-456-7890',
    isActive: true,
    is_banned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('renders outlet when user has allowed role', () => {
    const mockUser = createMockUser('admin');

    vi.spyOn(useCurrentUserModule, 'default').mockReturnValue(mockUser);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Protected allowedRoles={['admin']} />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('returns null when user is not logged in', () => {
    vi.spyOn(useCurrentUserModule, 'default').mockReturnValue(null);

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Protected allowedRoles={['admin']} />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('returns null when user does not have allowed role', () => {
    vi.spyOn(useCurrentUserModule, 'default').mockReturnValue(
      createMockUser('user')
    );

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Protected allowedRoles={['admin']} />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('navigates to login page when user is not logged in', () => {
    const navigateMock = vi.fn();
    vi.spyOn(reactRouterDom, 'useNavigate').mockReturnValue(navigateMock);
    vi.spyOn(useCurrentUserModule, 'default').mockReturnValue(null);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Protected allowedRoles={['admin']} />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  it('navigates to forbidden page when user does not have allowed role', () => {
    const navigateMock = vi.fn();
    vi.spyOn(reactRouterDom, 'useNavigate').mockReturnValue(navigateMock);
    vi.spyOn(useCurrentUserModule, 'default').mockReturnValue(
      createMockUser('user')
    );

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Protected allowedRoles={['admin']} />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(navigateMock).toHaveBeenCalledWith('/forbidden', expect.any(Object));
  });
});
