import styled from 'styled-components';

export const CartSection = styled.section`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

export const CartContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const CartItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const CartItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;

  img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
  }
`;

export const ItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .price {
    font-weight: bold;
    color: #007bff;
  }
`;

export const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  button {
    padding: 0.5rem 1rem;
    border: 1px solid #dee2e6;
    background: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #f8f9fa;
    }
  }

  span {
    min-width: 2rem;
    text-align: center;
  }
`;

export const CartSummary = styled.div`
  padding: 1.5rem;
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  height: fit-content;

  h2 {
    margin: 0 0 1rem 0;
  }
`;

export const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;

  &.total {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
    font-weight: bold;
    font-size: 1.1rem;
  }
`;

export const CheckoutButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

export const EmptyCart = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
  flex: 1;

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  a {
    color: #007bff;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;
