import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import UpdateUserForm from '../components/forms/UpdateUserForm';
import { User } from '../types/user';

describe('UpdateUserForm', () => {
  const mockUser: User = {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    phone: '123-456-7890',
    image: 'avatar.jpg',
    role: 'user',
    isActive: true,
    is_banned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  test('renders form with correct fields', () => {
    render(
      <UpdateUserForm
        onSubmit={mockOnSubmit}
        isUpdating={false}
        onCancel={mockOnCancel}
        currentUser={mockUser}
      />
    );

    expect(screen.getByLabelText(/old password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/^confirm new password$/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/profile image/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('prefills phone field with current user data', () => {
    render(
      <UpdateUserForm
        onSubmit={mockOnSubmit}
        isUpdating={false}
        onCancel={mockOnCancel}
        currentUser={mockUser}
      />
    );

    expect(screen.getByLabelText(/phone/i)).toHaveValue(mockUser.phone);
  });

  test('validates password matching', async () => {
    render(
      <UpdateUserForm
        onSubmit={mockOnSubmit}
        isUpdating={false}
        onCancel={mockOnCancel}
        currentUser={mockUser}
      />
    );

    fireEvent.input(screen.getByLabelText(/old password/i), {
      target: { value: 'oldpass123' },
    });
    fireEvent.input(screen.getByLabelText(/^new password$/i), {
      target: { value: 'newpass123' },
    });
    fireEvent.input(screen.getByLabelText(/^confirm new password$/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('submits form with correct data when changing password', async () => {
    const mockFormData = {
      append: vi.fn(),
    };

    vi.stubGlobal(
      'FormData',
      vi.fn(() => mockFormData)
    );

    render(
      <UpdateUserForm
        onSubmit={mockOnSubmit}
        isUpdating={false}
        onCancel={mockOnCancel}
        currentUser={mockUser}
      />
    );

    fireEvent.input(screen.getByLabelText(/old password/i), {
      target: { value: 'oldpass123' },
    });
    fireEvent.input(screen.getByLabelText(/^new password$/i), {
      target: { value: 'newpass123' },
    });
    fireEvent.input(screen.getByLabelText(/^confirm new password$/i), {
      target: { value: 'newpass123' },
    });
    fireEvent.input(screen.getByLabelText(/phone/i), {
      target: { value: '987-654-3210' },
    });

    const form = screen.getByText(/update/i).closest('form');
    if (!form) throw new Error('Form not found');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // Check that the second argument is true (hasPasswordChange)
    expect(mockOnSubmit.mock.calls[0][1]).toBe(true);
  });

  test('submits form with correct data when only updating phone', async () => {
    const mockFormData = {
      append: vi.fn(),
    };

    vi.stubGlobal(
      'FormData',
      vi.fn(() => mockFormData)
    );

    render(
      <UpdateUserForm
        onSubmit={mockOnSubmit}
        isUpdating={false}
        onCancel={mockOnCancel}
        currentUser={mockUser}
      />
    );

    fireEvent.input(screen.getByLabelText(/phone/i), {
      target: { value: '987-654-3210' },
    });

    const form = screen.getByText(/update/i).closest('form');
    if (!form) throw new Error('Form not found');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // Check that the second argument is false (no password change)
    expect(mockOnSubmit.mock.calls[0][1]).toBe(false);
  });

  test('disables form fields when updating', () => {
    render(
      <UpdateUserForm
        onSubmit={mockOnSubmit}
        isUpdating={true}
        onCancel={mockOnCancel}
        currentUser={mockUser}
      />
    );

    expect(screen.getByLabelText(/old password/i)).toBeDisabled();
    expect(screen.getByLabelText(/^new password$/i)).toBeDisabled();
    expect(screen.getByLabelText(/^confirm new password$/i)).toBeDisabled();
    expect(screen.getByLabelText(/phone/i)).toBeDisabled();
    expect(screen.getByLabelText(/profile image/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /updating/i })).toBeDisabled();
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(
      <UpdateUserForm
        onSubmit={mockOnSubmit}
        isUpdating={false}
        onCancel={mockOnCancel}
        currentUser={mockUser}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
