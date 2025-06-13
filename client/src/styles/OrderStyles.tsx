import styled from 'styled-components';

export const OrdersContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

export const OrdersHeader = styled.h2`
  color: var(--color-grey-900);
  margin-bottom: 2rem;
  text-align: center;
`;

export const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const OrderCard = styled.div`
  background: var(--color-grey-0);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
`;

export const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-grey-100);

  .order-id {
    font-size: 1.1rem;
    color: var(--color-grey-500);
    font-weight: 500;
  }

  .order-date {
    font-size: 0.9rem;
    color: var(--color-grey-500);
  }
`;

export const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const OrderItem = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem;
  background: var(--color-grey-50);
  border-radius: 4px;

  img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }

  .item-details {
    flex-grow: 1;

    h4 {
      margin: 0;
      color: var(--color-grey-700);
    }

    .quantity {
      color: var(--color-grey-500);
      font-size: 1rem;
      margin-top: 0.3rem;
      font-weight: 500;
    }
  }

  .price {
    color: var(--color-green-700);
    font-weight: 600;
  }
`;

export const OrderTotal = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-grey-100);
  text-align: right;
  font-weight: 600;
  color: var(--color-blue-700);
`;
