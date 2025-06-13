import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../pages/user/Register';
import useRegister from '../hooks/useRegister';
import { BrowserRouter } from 'react-router-dom';
import toast from 'react-hot-toast';

// Mock the hooks and dependencies
vi.mock('../hooks/useRegister');
vi.mock('react-hot-toast');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Register Component', () => {
  const mockRegisterUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (
      useRegister as import('vitest').MockedFunction<typeof useRegister>
    ).mockReturnValue({
      registerUser: mockRegisterUser,
      isRegistering: false,
    });
  });

  it('renders the register page correctly', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByTestId('register-page')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('handles successful registration', async () => {
    mockRegisterUser.mockResolvedValueOnce({
      message: 'Registration successful',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText('Full Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email Address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
      target: { value: '1234567890' },
    });

    // Submit the form
    const formElement = screen.getByTestId('registration-form');
    fireEvent.submit(formElement);

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Registration successful');
    });
  });

  it('handles registration failure', async () => {
    mockRegisterUser.mockRejectedValueOnce({ message: 'Registration failed' });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText('Full Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email Address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
      target: { value: '1234567890' },
    });

    // Submit the form
    const formElement = screen.getByTestId('registration-form');
    fireEvent.submit(formElement);

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Registration failed');
    });
  });
});
