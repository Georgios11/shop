import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Forbidden from '../pages/Forbidden';
import * as router from 'react-router-dom';
import { Location } from 'react-router-dom';

interface ForbiddenError {
  status?: string;
  message?: string;
  from?: string;
}

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: null }),
  };
});

describe('Forbidden Component', () => {
  let navigateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    navigateMock = vi.fn();
    vi.spyOn(router, 'useNavigate').mockReturnValue(navigateMock);
  });

  it('renders with default values when no error state is provided', () => {
    vi.spyOn(router, 'useLocation').mockReturnValue({
      state: null,
      pathname: '',
      search: '',
      hash: '',
      key: '',
    } as Location);

    render(<Forbidden />);

    expect(screen.getByTestId('forbidden-page')).toBeInTheDocument();
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('renders with custom error values when provided', () => {
    vi.spyOn(router, 'useLocation').mockReturnValue({
      state: {
        status: '401',
        message: 'Unauthorized Access',
        from: '/dashboard',
      } as ForbiddenError,
      pathname: '',
      search: '',
      hash: '',
      key: '',
    } as Location);

    render(<Forbidden />);

    expect(screen.getByTestId('forbidden-page')).toBeInTheDocument();
    expect(screen.getByText('401')).toBeInTheDocument();
    expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('navigates back one step when Go Back is clicked and from is not /admin', () => {
    vi.spyOn(router, 'useLocation').mockReturnValue({
      state: {
        status: '403',
        message: 'Access Denied',
        from: '/dashboard',
      } as ForbiddenError,
      pathname: '',
      search: '',
      hash: '',
      key: '',
    } as Location);

    render(<Forbidden />);

    fireEvent.click(screen.getByText('Go Back'));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('navigates back two steps when Go Back is clicked and from is /admin', () => {
    vi.spyOn(router, 'useLocation').mockReturnValue({
      state: {
        status: '403',
        message: 'Access Denied',
        from: '/admin',
      } as ForbiddenError,
      pathname: '',
      search: '',
      hash: '',
      key: '',
    } as Location);

    render(<Forbidden />);

    fireEvent.click(screen.getByText('Go Back'));

    expect(navigateMock).toHaveBeenCalledWith(-2, { replace: true });
  });
});
