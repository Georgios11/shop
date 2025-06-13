import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../pages/Login';
import useLogin from '../hooks/useLogin';
import useRefreshToken from '../hooks/useRefreshToken';

// Mock the hooks and dependencies
vi.mock('../hooks/useLogin');
vi.mock('../hooks/useRefreshToken');
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockNavigate = vi.fn();
const mockLogIn = vi.fn();
const mockRefreshToken = vi.fn();

describe('Login Component', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLogin).mockReturnValue({
      logIn: mockLogIn,
      isLoggingIn: false,
    });

    vi.mocked(useRefreshToken).mockReturnValue(mockRefreshToken);
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderLogin = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders the login page with correct elements', () => {
    renderLogin();

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('New user?')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Register' })
    ).toBeInTheDocument();
  });

  // Test only the component rendering and props passing
  it('passes correct props to LoginForm', () => {
    renderLogin();

    // Verify LoginForm is rendered
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
  });
});
