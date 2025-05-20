import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { RouteObject } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastOptions } from 'react-hot-toast';

interface PersistOptions {
  persister: unknown;
}

interface QueryProviderProps {
  children: React.ReactNode;
  client: QueryClient;
  persistOptions: PersistOptions;
}

interface ToasterProps {
  position?: ToastOptions['position'];
}

// Create query client with same config as the app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour
      gcTime: 1000 * 60 * 60 * 2, // 2 hours
      retry: 2,
    },
  },
});

// Mock the router
vi.mock('react-router-dom', () => ({
  RouterProvider: ({ router }: { router: { routes: RouteObject[] } }) => (
    <div data-testid="router-provider">{router.routes[0].element}</div>
  ),
  createBrowserRouter: (routes: RouteObject[]) => ({ routes }),
  NavLink: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid="nav-link">
      {children}
    </a>
  ),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid="link">
      {children}
    </a>
  ),
  Outlet: () => <div data-testid="outlet" />,
  useNavigate: () => vi.fn(),
}));

// Mock react-query-persist-client
vi.mock('@tanstack/react-query-persist-client', () => ({
  PersistQueryClientProvider: ({
    children,
    client,
    persistOptions,
  }: QueryProviderProps) => (
    <div
      data-testid="query-provider"
      data-client={!!client}
      data-persister={!!persistOptions?.persister}
    >
      {children}
    </div>
  ),
  persistQueryClient: vi.fn(),
}));

// Mock react-query-devtools
vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => <div data-testid="query-devtools" />,
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  Toaster: (props: ToasterProps) => (
    <div data-testid="toast-container" data-position={props.position} />
  ),
}));

// Mock ErrorBoundary
vi.mock('../components/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

// Mock AppContainer
vi.mock('../styles/AppContainer', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-container">{children}</div>
  ),
}));

// Mock GlobalStyles
vi.mock('../styles/GlobalStyles', () => ({
  default: () => <div data-testid="global-styles" />,
}));

describe('App', () => {
  it('renders with all required providers and components', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    // Check error boundaries (both in App and AppLayout)
    const errorBoundaries = screen.getAllByTestId('error-boundary');
    expect(errorBoundaries).toHaveLength(2);

    // Check query provider with required props
    const queryProvider = screen.getByTestId('query-provider');
    expect(queryProvider).toBeInTheDocument();
    expect(queryProvider).toHaveAttribute('data-client', 'true');
    expect(queryProvider).toHaveAttribute('data-persister', 'true');

    // Check app container
    expect(screen.getByTestId('app-container')).toBeInTheDocument();

    // Check devtools
    expect(screen.getByTestId('query-devtools')).toBeInTheDocument();

    // Check global styles
    expect(screen.getByTestId('global-styles')).toBeInTheDocument();

    // Check toast container with config
    const toastContainer = screen.getByTestId('toast-container');
    expect(toastContainer).toBeInTheDocument();
    expect(toastContainer).toHaveAttribute('data-position', 'top-right');

    // Check router provider
    expect(screen.getByTestId('router-provider')).toBeInTheDocument();
  });
});
