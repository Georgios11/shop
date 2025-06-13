import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LoginForm from '../components/forms/LoginForm';
import toast from 'react-hot-toast';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('LoginForm', () => {
  const mockOnLogin = vi.fn();
  const defaultProps = {
    onLogin: mockOnLogin,
    isLoggingIn: false,
  };

  const renderLoginForm = () => {
    return render(
      <BrowserRouter>
        <LoginForm {...defaultProps} />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with all elements', () => {
    renderLoginForm();

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Forgot Password?' })
    ).toBeInTheDocument();
  });

  it('shows validation errors for invalid email', async () => {
    renderLoginForm();

    const emailInput = screen.getByPlaceholderText('Email');
    const submitButton = screen.getByRole('button', { name: 'Log In' });

    // Enter invalid email and submit form
    fireEvent.change(emailInput, { target: { value: 'invalid-email@email' } });
    fireEvent.click(submitButton);

    // Wait for the validation message
    await waitFor(
      () => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('shows validation error for empty password', async () => {
    renderLoginForm();

    const submitButton = screen.getByRole('button', { name: 'Log In' });

    // Trigger validation by submitting the form
    fireEvent.click(submitButton);

    // Wait for the validation message
    await waitFor(
      () => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      },
      { timeout: 3000 }
    ); // Increase timeout to give more time for validation
  });

  it('calls onLogin with form data when submitted with valid inputs', async () => {
    renderLoginForm();

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: 'Log In' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows loading state when isLoggingIn is true', () => {
    render(
      <BrowserRouter>
        <LoginForm {...defaultProps} isLoggingIn={true} />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('button', { name: 'Logging in...' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Logging in...' })
    ).toBeDisabled();
  });

  it('navigates to forgot password page when forgot password button is clicked', () => {
    renderLoginForm();

    const forgotPasswordButton = screen.getByRole('button', {
      name: 'Forgot Password?',
    });
    fireEvent.click(forgotPasswordButton);

    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });

  it('handles login error and shows toast message', async () => {
    const errorMessage = 'Invalid credentials';
    mockOnLogin.mockRejectedValueOnce(new Error(errorMessage));

    renderLoginForm();

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: 'Log In' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('navigates to forbidden page on 403 error', async () => {
    const customError = new Error('Access denied') as Error & {
      status?: number;
    };
    customError.status = 403;
    mockOnLogin.mockRejectedValueOnce(customError);

    renderLoginForm();

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: 'Log In' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/forbidden', {
        state: { status: 403, message: 'Access denied' },
      });
    });
  });
});
