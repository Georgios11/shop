import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ManageOrders from '../pages/admin/ManageOrders';
import useOrdersQuery from '../hooks/useOrdersQuery';
import { OrderStatus } from '../constants/order';

// Mock the custom hook
vi.mock('../hooks/useOrdersQuery');

const mockedUseOrdersQuery = vi.mocked(useOrdersQuery);

describe('ManageOrders', () => {
  it('should show loading spinner when data is loading', () => {
    mockedUseOrdersQuery.mockReturnValue({
      orders: [],
      isOrdersLoading: true,
      isOrdersFetching: false,
      error: null,
    });

    render(<ManageOrders />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should display empty message when no orders exist', () => {
    mockedUseOrdersQuery.mockReturnValue({
      orders: [],
      isOrdersLoading: false,
      isOrdersFetching: false,
      error: null,
    });

    render(<ManageOrders />);
    expect(
      screen.getByText('No orders found in the database')
    ).toBeInTheDocument();
  });

  it('should render orders when data is available', () => {
    const mockOrders = [
      {
        _id: 'order1',
        user: 'user1',
        status: 'pending' as OrderStatus,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        userModel: 'User' as const,
        userType: 'customer',
        orderItems: [
          {
            productId: 'prod1',
            productName: 'Test Product',
            quantity: 2,
            price: 25,
            image: 'test.jpg',
          },
        ],
        totalPrice: 50,
      },
    ];

    mockedUseOrdersQuery.mockReturnValue({
      orders: mockOrders,
      isOrdersLoading: false,
      isOrdersFetching: false,
      error: null,
    });

    render(<ManageOrders />);

    expect(screen.getByText('All Orders')).toBeInTheDocument();
    expect(screen.getByText('Order ID: order1')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Total: $50')).toBeInTheDocument();
  });
});
