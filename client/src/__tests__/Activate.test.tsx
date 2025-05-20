import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Activate from '../pages/Activate';
import useActivate from '../hooks/useActivate';

// Mock dependencies
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../hooks/useActivate');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Activate Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    vi.mocked(useActivate).mockReturnValue({
      activate: vi.fn(),
      isActivating: false,
      isActivatingError: false,
    });

    render(
      <MemoryRouter initialEntries={['/activate/valid-token']}>
        <Routes>
          <Route path="/activate/:token" element={<Activate />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('activate-page')).toBeInTheDocument();
    expect(screen.getByText('Account Activation')).toBeInTheDocument();
    expect(
      screen.getByText('Click the button below to activate your account:')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Activate Account' })
    ).toBeInTheDocument();
  });

  it('shows loading state during activation', () => {
    vi.mocked(useActivate).mockReturnValue({
      activate: vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        ),
      isActivating: true,
      isActivatingError: false,
    });

    render(
      <MemoryRouter initialEntries={['/activate/valid-token']}>
        <Routes>
          <Route path="/activate/:token" element={<Activate />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole('button', { name: 'Activating...' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows error message when activation fails', () => {
    vi.mocked(useActivate).mockReturnValue({
      activate: vi.fn(),
      isActivating: false,
      isActivatingError: true,
    });

    render(
      <MemoryRouter initialEntries={['/activate/valid-token']}>
        <Routes>
          <Route path="/activate/:token" element={<Activate />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText(
        'Activation failed. Please try again or contact support.'
      )
    ).toBeInTheDocument();
  });

  it('handles successful activation', async () => {
    const mockActivate = vi
      .fn()
      .mockResolvedValue({ message: 'Account activated successfully' });
    vi.mocked(useActivate).mockReturnValue({
      activate: mockActivate,
      isActivating: false,
      isActivatingError: false,
    });

    render(
      <MemoryRouter initialEntries={['/activate/valid-token']}>
        <Routes>
          <Route path="/activate/:token" element={<Activate />} />
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Activate Account' }));

    expect(mockActivate).toHaveBeenCalledWith('valid-token');
    expect(toast.success).toHaveBeenCalledWith(
      'Account activated successfully'
    );
  });

  it('handles activation with no token', async () => {
    const mockActivate = vi.fn();
    vi.mocked(useActivate).mockReturnValue({
      activate: mockActivate,
      isActivating: false,
      isActivatingError: false,
    });

    render(
      <MemoryRouter initialEntries={['/activate/']}>
        <Routes>
          <Route path="/activate/:token?" element={<Activate />} />
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Activate Account' }));

    expect(toast.error).toHaveBeenCalledWith('Invalid activation token');
    expect(mockActivate).not.toHaveBeenCalled();
  });

  it('handles error thrown during activation', async () => {
    const mockActivate = vi
      .fn()
      .mockRejectedValue(new Error('Activation failed'));
    vi.mocked(useActivate).mockReturnValue({
      activate: mockActivate,
      isActivating: false,
      isActivatingError: false,
    });

    render(
      <MemoryRouter initialEntries={['/activate/valid-token']}>
        <Routes>
          <Route path="/activate/:token" element={<Activate />} />
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Activate Account' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Activation failed');
    });
  });
});
