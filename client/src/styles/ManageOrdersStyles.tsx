import styled from 'styled-components';

export const OrdersContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

export const EmptyMessage = styled.p`
  text-align: center;
  color: var(--color-grey-500);
  font-size: 1.2rem;
  margin: 2rem 0;
`;

export const OrdersHeader = styled.h2`
  color: var(--color-grey-700);
  margin-bottom: 2rem;
  text-align: center;
`;

export const OrdersGrid = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const OrderCard = styled.div`
  background: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

export const OrderHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-grey-100);
`;

export const OrderInfo = styled.span`
  font-size: 0.9rem;
  color: var(--color-grey-500);
  display: flex;
  justify-content: space-between;
  align-items: center;

  &.order-id {
    color: var(--color-grey-700);
    font-weight: 600;
  }

  &.order-date {
    font-style: italic;
  }
`;

interface OrderStatusProps {
  $status: 'processing' | 'delivered' | 'cancelled' | string;
}

export const OrderStatus = styled.span<OrderStatusProps>`
  padding: 0.4rem 1rem;
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  text-align: center;

  ${(props) => {
    switch (props.$status) {
      case 'processing':
        return 'background-color: var(--color-yellow-100); color: var(--color-yellow-700);';
      case 'delivered':
        return 'background-color: var(--color-green-100); color: var(--color-green-700);';
      case 'cancelled':
        return 'background-color: var(--color-red-100); color: var(--color-red-700);';
      default:
        return 'background-color: var(--color-grey-100); color: var(--color-grey-700);';
    }
  }}
`;

export const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
  flex: 1;
`;

export const OrderItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0.8rem;
  background: var(--color-grey-50);
  border-radius: var(--border-radius-sm);
  align-items: center;

  img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: var(--border-radius-sm);
  }
`;

export const ItemDetails = styled.div`
  flex: 1;

  h4 {
    margin: 0;
    color: var(--color-grey-700);
    font-size: 0.9rem;
  }

  p {
    margin: 0.2rem 0;
    color: var(--color-grey-500);
    font-size: 0.85rem;

    &.price {
      color: var(--color-green-700);
      font-weight: 500;
    }
  }
`;

export const OrderTotal = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem 0;
  border-top: 1px solid var(--color-grey-100);
  font-weight: 600;
  color: var(--color-blue-700);
  position: absolute;
  bottom: 0;
  left: 1.5rem;
  right: 1.5rem;
  background: var(--color-grey-0);
`;
