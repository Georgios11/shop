import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegistrationForm from '../components/forms/RegistrationForm';
import '@testing-library/jest-dom';

// Mock the onSubmit prop with proper typing
const mockOnSubmit = vi.fn() as unknown as (data: FormData) => Promise<void>;

describe('RegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (isRegistering = false) => {
    return render(
      <RegistrationForm onSubmit={mockOnSubmit} isRegistering={isRegistering} />
    );
  };

  describe('Form Rendering', () => {
    it('renders all form fields correctly', () => {
      renderForm();

      // Check if all inputs are present with placeholders
      expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Confirm Password')
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();

      // File input doesn't have placeholder, so use type attribute
      const fileInputs = screen.getAllByDisplayValue('');
      const fileInput = fileInputs.find(
        (input) => input.getAttribute('type') === 'file'
      );
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute(
        'accept',
        'image/jpeg,image/jpg,image/png'
      );

      expect(
        screen.getByRole('button', { name: /Register/i })
      ).toBeInTheDocument();
    });

    it('displays "Creating Account..." when isRegistering is true', () => {
      renderForm(true);
      expect(
        screen.getByRole('button', { name: /Creating Account/i })
      ).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty fields', async () => {
      renderForm();
      const user = userEvent.setup();

      // Submit empty form
      await user.click(screen.getByRole('button', { name: /Register/i }));

      // Check validation messages
      expect(
        await screen.findByText('Name must be at least 2 characters')
      ).toBeInTheDocument();
      expect(
        await screen.findByText('Please enter a valid email address')
      ).toBeInTheDocument();
      expect(
        await screen.findByText('Password must be at least 6 characters')
      ).toBeInTheDocument();
      expect(
        await screen.findByText('Please enter a valid phone number')
      ).toBeInTheDocument();
    });

    it('validates password match', async () => {
      renderForm();
      const user = userEvent.setup();

      // Fill in mismatched passwords
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.type(
        screen.getByPlaceholderText('Confirm Password'),
        'differentpassword'
      );
      await user.click(screen.getByRole('button', { name: /Register/i }));

      expect(
        await screen.findByText("Passwords don't match")
      ).toBeInTheDocument();
    });
  });

  describe('File Upload', () => {
    it('validates file size restriction', async () => {
      renderForm();
      const user = userEvent.setup();

      // Create a large file (>2MB)
      const largeFile = new File(['x'.repeat(2.1 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      });

      // Find file input and upload
      const fileInputs = screen.getAllByDisplayValue('');
      const fileInput = fileInputs.find(
        (input) => input.getAttribute('type') === 'file'
      )!;
      await user.upload(fileInput, largeFile);

      // Check for error message in the DOM instead of alert
      expect(
        await screen.findByText('Image file is larger than 2MB')
      ).toBeInTheDocument();
    });

    it('displays image preview when valid image uploaded', async () => {
      renderForm();
      const user = userEvent.setup();

      // Mock FileReader
      const readAsDataURLMock = vi.fn();
      const fileReaderMock = {
        onloadend: vi.fn(),
        readAsDataURL: readAsDataURLMock,
        result: 'data:image/jpeg;base64,testimage',
      } as unknown as FileReader;

      vi.spyOn(global, 'FileReader').mockImplementation(() => fileReaderMock);

      // Create valid file
      const validFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });

      // Find file input and upload
      const fileInputs = screen.getAllByDisplayValue('');
      const fileInput = fileInputs.find(
        (input) => input.getAttribute('type') === 'file'
      );
      expect(fileInput).not.toBeUndefined();
      if (fileInput) {
        await user.upload(fileInput, validFile);
      }

      // Trigger onloadend event
      if (typeof fileReaderMock.onloadend === 'function') {
        const event = {
          target: fileReaderMock,
          lengthComputable: true,
          loaded: 1,
          total: 1,
        } as ProgressEvent<FileReader>;

        fileReaderMock.onloadend(event);
      }

      expect(await screen.findByAltText('Preview')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form data when all fields valid', async () => {
      renderForm();
      const user = userEvent.setup();

      // Fill all required fields
      await user.type(screen.getByPlaceholderText('Full Name'), 'John Doe');
      await user.type(
        screen.getByPlaceholderText('Email Address'),
        'john@example.com'
      );
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.type(
        screen.getByPlaceholderText('Confirm Password'),
        'password123'
      );
      await user.type(
        screen.getByPlaceholderText('Phone Number'),
        '1234567890'
      );

      // Create valid file
      const validFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });

      // Find file input and upload
      const fileInputs = screen.getAllByDisplayValue('');
      const fileInput = fileInputs.find(
        (input) => input.getAttribute('type') === 'file'
      );
      expect(fileInput).not.toBeUndefined();
      if (fileInput) {
        await user.upload(fileInput, validFile);
      }

      // Submit form
      await user.click(screen.getByRole('button', { name: /Register/i }));

      // Verify onSubmit called with FormData
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith(expect.any(FormData));
      });
    });

    it('resets form after successful submission', async () => {
      renderForm();
      const user = userEvent.setup();

      // Fill all fields
      await user.type(screen.getByPlaceholderText('Full Name'), 'John Doe');
      await user.type(
        screen.getByPlaceholderText('Email Address'),
        'john@example.com'
      );
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.type(
        screen.getByPlaceholderText('Confirm Password'),
        'password123'
      );
      await user.type(
        screen.getByPlaceholderText('Phone Number'),
        '1234567890'
      );

      // Mock successful submission
      (
        mockOnSubmit as unknown as {
          mockResolvedValueOnce: (value: unknown) => void;
        }
      ).mockResolvedValueOnce(undefined);

      // Submit form
      await user.click(screen.getByRole('button', { name: /Register/i }));

      // Verify form reset
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Full Name')).toHaveValue('');
        expect(screen.getByPlaceholderText('Email Address')).toHaveValue('');
        expect(screen.getByPlaceholderText('Password')).toHaveValue('');
        expect(screen.getByPlaceholderText('Confirm Password')).toHaveValue('');
        expect(screen.getByPlaceholderText('Phone Number')).toHaveValue('');
      });
    });
  });
});
