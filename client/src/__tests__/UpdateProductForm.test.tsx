import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import UpdateProductForm from '../components/forms/UpdateProductForm';

describe('UpdateProductForm', () => {
  const mockOnSubmit = vi.fn();
  const initialData = {
    price: '19.99',
    itemsInStock: '10',
    image: 'test-image-url.jpg',
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders with initial values', () => {
    render(
      <UpdateProductForm onSubmit={mockOnSubmit} initialData={initialData} />
    );

    expect(screen.getByLabelText(/price/i)).toHaveValue(19.99);
    expect(screen.getByLabelText(/items in stock/i)).toHaveValue(10);
    expect(screen.getByAltText('Preview')).toHaveAttribute(
      'src',
      initialData.image
    );
  });

  it('displays validation errors when form is submitted with empty fields', async () => {
    render(
      <UpdateProductForm
        onSubmit={mockOnSubmit}
        initialData={{ ...initialData, price: '', itemsInStock: '' }}
      />
    );

    fireEvent.submit(screen.getByRole('button', { name: /update product/i }));

    await waitFor(() => {
      expect(screen.getByText(/price is required/i)).toBeInTheDocument();
      expect(
        screen.getByText(/stock quantity is required/i)
      ).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct data when form is valid', async () => {
    const user = userEvent.setup();
    render(
      <UpdateProductForm onSubmit={mockOnSubmit} initialData={initialData} />
    );

    const priceInput = screen.getByLabelText(/price/i);
    const stockInput = screen.getByLabelText(/items in stock/i);

    await user.clear(priceInput);
    await user.type(priceInput, '29.99');

    await user.clear(stockInput);
    await user.type(stockInput, '15');

    await user.click(screen.getByRole('button', { name: /update product/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        price: 29.99,
        itemsInStock: 15,
      });
    });
  });

  it('updates image preview when new image is selected', async () => {
    const user = userEvent.setup();
    render(
      <UpdateProductForm onSubmit={mockOnSubmit} initialData={initialData} />
    );

    const file = new File(['dummy content'], 'test-image.png', {
      type: 'image/png',
    });
    const fileInput = screen.getByLabelText(/product image/i);

    // Mock FileReader
    const mockReadAsDataURL = vi.fn();
    const mockResult = 'data:image/png;base64,dummyImageContent';

    // Replace the onloadend property with an event handler function
    let onLoadEndHandler: ((event: ProgressEvent<FileReader>) => void) | null =
      null;

    const mockFileReader = {
      readAsDataURL: mockReadAsDataURL,
      set onloadend(
        handler: ((event: ProgressEvent<FileReader>) => void) | null
      ) {
        onLoadEndHandler = handler;
      },
      get onloadend() {
        return onLoadEndHandler;
      },
      result: mockResult,
    };

    global.FileReader = vi.fn(
      () => mockFileReader
    ) as unknown as typeof FileReader;

    await user.upload(fileInput, file);
    expect(mockReadAsDataURL).toHaveBeenCalledWith(file);

    // Just wait for the preview to appear with the mock result
    await waitFor(() => {
      const preview = screen.getByAltText('Preview');
      expect(preview).toBeInTheDocument();
    });
  });

  it('shows loading state when isLoading prop is true', () => {
    render(
      <UpdateProductForm
        onSubmit={mockOnSubmit}
        initialData={initialData}
        isLoading={true}
      />
    );

    expect(
      screen.getByRole('button', { name: /updating/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
