import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Orders from '../pages/user/Orders';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock hooks
vi.mock('../hooks/useCurrentUser', () => ({
  default: () => ({ _id: 'user123' }),
}));

describe('Orders Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it('displays no orders message when no orders exist', () => {
    // Setup empty orders data
    queryClient.setQueryData(['orders'], []);

    render(
      <QueryClientProvider client={queryClient}>
        <Orders />
      </QueryClientProvider>
    );

    expect(screen.getByText('No orders found')).toBeInTheDocument();
  });

  it('displays order details when orders exist', () => {
    // Mock order data
    const mockOrders = [
      {
        _id: 'order123',
        user: 'user123',
        orderItems: [
          {
            productId: 'prod1',
            productName: 'Test Product',
            quantity: 2,
            price: 25.99,
            image: 'test.jpg',
          },
        ],
        totalPrice: 51.98,
        createdAt: '2023-05-15T10:30:00Z',
      },
    ];

    queryClient.setQueryData(['orders'], mockOrders);

    render(
      <QueryClientProvider client={queryClient}>
        <Orders />
      </QueryClientProvider>
    );

    expect(screen.getByText('Your Orders')).toBeInTheDocument();
    expect(screen.getByText(/Order ID: order123/)).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
    expect(screen.getByText('$25.99')).toBeInTheDocument();
    expect(screen.getByText('Total: $51.98')).toBeInTheDocument();
  });

  it('filters orders to show only current user orders', () => {
    // Mock multiple orders with different users
    const mockOrders = [
      {
        _id: 'order123',
        user: 'user123', // current user
        orderItems: [
          {
            productId: 'prod1',
            productName: 'User Product',
            quantity: 1,
            price: 10,
            image: 'test.jpg',
          },
        ],
        totalPrice: 10,
        createdAt: '2023-05-15T10:30:00Z',
      },
      {
        _id: 'order456',
        user: 'otherUser', // different user
        orderItems: [
          {
            productId: 'prod2',
            productName: 'Other Product',
            quantity: 1,
            price: 20,
            image: 'test.jpg',
          },
        ],
        totalPrice: 20,
        createdAt: '2023-05-16T10:30:00Z',
      },
    ];

    queryClient.setQueryData(['orders'], mockOrders);

    render(
      <QueryClientProvider client={queryClient}>
        <Orders />
      </QueryClientProvider>
    );

    expect(screen.getByText('User Product')).toBeInTheDocument();
    expect(screen.queryByText('Other Product')).not.toBeInTheDocument();
  });
});
