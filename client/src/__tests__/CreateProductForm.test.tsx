import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateProductForm from '../components/forms/CreateProductForm';

type Category = {
  _id: string;
  name: string;
};

type CategoriesCache = {
  categories: Category[];
};

// Mock the useCategoriesCache hook
const mockUseCategoriesCache = vi.fn().mockReturnValue({
  categories: [
    { _id: '1', name: 'Category 1' },
    { _id: '2', name: 'Category 2' },
  ],
} satisfies CategoriesCache);

vi.mock('../hooks/useCategoriesCache', () => ({
  default: () => mockUseCategoriesCache() as CategoriesCache,
}));

describe('CreateProductForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockUseCategoriesCache.mockReturnValue({
      categories: [
        { _id: '1', name: 'Category 1' },
        { _id: '2', name: 'Category 2' },
      ],
    });
  });

  it('should render all form fields correctly', () => {
    render(<CreateProductForm onSubmit={mockOnSubmit} />);

    // Check all form elements are present
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/brand/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/items in stock/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/product image/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create product/i })
    ).toBeInTheDocument();
  });

  it('should render submit button with loading state', () => {
    render(<CreateProductForm onSubmit={mockOnSubmit} isLoading={true} />);
    expect(
      screen.getByRole('button', { name: /creating/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show validation errors when submitting empty form', async () => {
    render(<CreateProductForm onSubmit={mockOnSubmit} />);

    await userEvent.click(
      screen.getByRole('button', { name: /create product/i })
    );

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/description is required/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/brand is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/category is required/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/price is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/stock quantity is required/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/image is required/i)).toBeInTheDocument();
  });

  it('should show image preview when valid image is selected', async () => {
    render(<CreateProductForm onSubmit={mockOnSubmit} />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/product image/i);

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      result: 'data:image/png;base64,test',
      onloadend: null as ((event: ProgressEvent<FileReader>) => void) | null,
      error: null,
      onabort: null,
      onerror: null,
      onload: null,
      readyState: 0 as 0 | 1 | 2,
      abort: vi.fn(),
      readAsArrayBuffer: vi.fn(),
      readAsBinaryString: vi.fn(),
      readAsText: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onloadstart: null,
      onprogress: null,
      EMPTY: 0,
      LOADING: 1,
      DONE: 2,
    };

    const FileReaderMock = vi.fn(() => mockFileReader);
    Object.assign(FileReaderMock, {
      EMPTY: 0,
      LOADING: 1,
      DONE: 2,
      prototype: mockFileReader,
    });
    global.FileReader = FileReaderMock as unknown as typeof FileReader;

    await userEvent.upload(input, file);

    // Trigger the onloadend callback
    mockFileReader.onloadend?.({
      target: mockFileReader,
      lengthComputable: true,
      loaded: 100,
      total: 100,
      bubbles: false,
      cancelBubble: false,
      cancelable: false,
      composed: false,
      currentTarget: mockFileReader,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: true,
      returnValue: true,
      srcElement: mockFileReader,
      timeStamp: 0,
      type: 'loadend',
      composedPath: () => [],
      initEvent: () => {},
      preventDefault: () => {},
      stopImmediatePropagation: () => {},
      stopPropagation: () => {},
      AT_TARGET: 0,
      BUBBLING_PHASE: 0,
      CAPTURING_PHASE: 0,
    } as unknown as ProgressEvent<FileReader>);

    expect(await screen.findByAltText(/preview/i)).toBeInTheDocument();
  });

  it('should throw error when selected category is not found', async () => {
    render(<CreateProductForm onSubmit={mockOnSubmit} />);

    // Fill in the form with valid data but trigger the error by modifying the categories
    await userEvent.type(
      screen.getByLabelText(/product name/i),
      'Test Product'
    );
    await userEvent.type(
      screen.getByLabelText(/description/i),
      'Test Description'
    );
    await userEvent.type(screen.getByLabelText(/brand/i), 'Test Brand');

    // Mock the useCategoriesCache hook to return empty categories
    mockUseCategoriesCache.mockReturnValue({ categories: [] });

    // Select a category that exists in the DOM but not in the mocked data
    await userEvent.selectOptions(screen.getByLabelText(/category/i), '1');

    await userEvent.type(screen.getByLabelText(/price/i), '99.99');
    await userEvent.type(screen.getByLabelText(/items in stock/i), '10');

    // Mock file upload
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/product image/i);
    const fileList = {
      0: file,
      length: 1,
      item: () => file,
      [Symbol.iterator]: function* () {
        yield file;
      },
    } as unknown as FileList;

    Object.defineProperty(input, 'files', {
      value: fileList,
    });

    await userEvent.click(
      screen.getByRole('button', { name: /create product/i })
    );

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
