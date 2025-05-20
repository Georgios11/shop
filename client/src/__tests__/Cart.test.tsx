import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from '../pages/Cart';
import * as useCurrentUserHook from '../hooks/useCurrentUser';
import * as useAddToCartHook from '../hooks/useAddToCart';
import * as useRemoveFromCartHook from '../hooks/useRemoveFromCart';
import * as usePlaceOrderHook from '../hooks/usePlaceOrder';
import toast from 'react-hot-toast';
import * as reactRouterDom from 'react-router-dom';

// Mock the hooks
vi.mock('../hooks/useCurrentUser');
vi.mock('../hooks/useAddToCart');
vi.mock('../hooks/useRemoveFromCart');
vi.mock('../hooks/usePlaceOrder');
vi.mock('react-hot-toast');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Cart Component', () => {
  const mockNavigate = vi.fn();

  const mockCart = {
    items: [
      {
        productId: '1',
        productName: 'Test Product',
        price: 19.99,
        quantity: 2,
        image: 'test-image.jpg',
      },
    ],
    totalPrice: 39.98,
    user: '123',
    status: 'active',
    userType: 'registered',
  };

  const mockUser = {
    _id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    cart: mockCart,
    favorites: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
    address: '',
    phone: '',
    isActive: true,
    is_banned: false,
  };

  const mockEmptyUser = {
    _id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    cart: {
      items: [],
      totalPrice: 0,
      user: '123',
      status: 'active',
      userType: 'registered',
    },
    favorites: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
    address: '',
    phone: '',
    isActive: true,
    is_banned: false,
  };

  const mockAddToCart = vi.fn();
  const mockRemoveFromCart = vi.fn();
  const mockPlaceOrder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useCurrentUserHook, 'default').mockReturnValue(mockUser);
    vi.spyOn(useAddToCartHook, 'default').mockReturnValue({
      addToCart: mockAddToCart,
      isAddingToCart: false,
    });
    vi.spyOn(useRemoveFromCartHook, 'default').mockReturnValue({
      removeFromCart: mockRemoveFromCart,
      isRemovingFromCart: false,
    });
    vi.spyOn(usePlaceOrderHook, 'default').mockReturnValue({
      placeOrder: mockPlaceOrder,
      isLoading: false,
    });
    vi.spyOn(reactRouterDom, 'useNavigate').mockReturnValue(mockNavigate);
  });

  it('renders cart with items', () => {
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    expect(screen.getByTestId('cart-page')).toBeInTheDocument();
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Use getAllByText for the price that appears multiple times
    const priceElements = screen.getAllByText('$39.98');
    expect(priceElements.length).toBeGreaterThan(0);

    expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
  });

  it('renders empty cart message when cart is empty', () => {
    vi.spyOn(useCurrentUserHook, 'default').mockReturnValue(mockEmptyUser);

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    expect(screen.getByTestId('empty-cart')).toBeInTheDocument();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
  });

  it('increases product quantity when + button is clicked', async () => {
    mockAddToCart.mockResolvedValue({ message: 'Item added to cart' });

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    const increaseButton = screen.getAllByText('+')[0];
    fireEvent.click(increaseButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Item added to cart');
    });
  });

  it('decreases product quantity when - button is clicked', async () => {
    mockRemoveFromCart.mockResolvedValue({ message: 'Item removed from cart' });

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    const decreaseButton = screen.getAllByText('-')[0];
    fireEvent.click(decreaseButton);

    await waitFor(() => {
      expect(mockRemoveFromCart).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Item removed from cart');
    });
  });

  it('places order when checkout button is clicked', async () => {
    mockPlaceOrder.mockResolvedValue({});

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    const checkoutButton = screen.getByText('Proceed to Checkout');
    fireEvent.click(checkoutButton);

    await waitFor(() => {
      expect(mockPlaceOrder).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Order placed successfully!');
      expect(mockNavigate).toHaveBeenCalledWith('/user/orders');
    });
  });

  it('shows loading state during checkout', () => {
    vi.spyOn(usePlaceOrderHook, 'default').mockReturnValue({
      placeOrder: mockPlaceOrder,
      isLoading: true,
    });

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('handles error when increasing quantity fails', async () => {
    const error = new Error('Failed to add item');
    mockAddToCart.mockRejectedValue(error);

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    const increaseButton = screen.getAllByText('+')[0];
    fireEvent.click(increaseButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith('1');
      expect(toast.error).toHaveBeenCalledWith('Failed to add item');
    });
  });

  it('handles error when decreasing quantity fails', async () => {
    const error = new Error('Failed to remove item');
    mockRemoveFromCart.mockRejectedValue(error);

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    const decreaseButton = screen.getAllByText('-')[0];
    fireEvent.click(decreaseButton);

    await waitFor(() => {
      expect(mockRemoveFromCart).toHaveBeenCalledWith('1');
      expect(toast.error).toHaveBeenCalledWith('Failed to remove item');
    });
  });

  it('handles error when checkout fails', async () => {
    const error = new Error('Checkout failed');
    mockPlaceOrder.mockRejectedValue(error);

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    const checkoutButton = screen.getByText('Proceed to Checkout');
    fireEvent.click(checkoutButton);

    await waitFor(() => {
      expect(mockPlaceOrder).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Checkout failed');
    });
  });

  it('redirects to home when user is not logged in', () => {
    vi.spyOn(useCurrentUserHook, 'default').mockReturnValue(null);

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
