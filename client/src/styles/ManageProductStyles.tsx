import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
  flex: 1;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 80%;
`;

export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 80%;
  margin: 0 auto;
  box-sizing: border-box;
  grid-auto-rows: 1fr;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 2fr));
    max-width: 90%;
  }

  @media (max-width: 580px) {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    max-width: 100%;
  }
`;

export const ProductCard = styled(Link)`
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
`;

interface ProductContentProps {
  $itemsInStock: number;
}

export const ProductContent = styled.div<ProductContentProps>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: start;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  height: 100%;
  flex: 1;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  }

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  }

  h2 {
    font-size: 1.25rem;
    font-weight: bold;
    color: #333333;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1rem;
    color: #555555;
    margin-bottom: 0.25rem;

    &.price {
      font-size: 1.125rem;
      font-weight: bold;
      color: #007bff;
      margin-top: auto;
    }

    &.description {
      font-size: 1rem;
      color: #888888;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }

    &.stock {
      font-size: 1rem;
      font-weight: bold;
      color: ${({ $itemsInStock }) =>
        $itemsInStock > 0 ? '#28a745' : '#dc3545'};
    }
    &.likes {
      font-size: 1rem;
      color: #28a745;
      font-style: italic;
      margin-top: 0.5rem;
    }
  }
`;

export const CategoryLink = styled(Link)`
  margin-left: -20px;
  height: 34px;
  padding: 6px 26px;
  font-style: normal;
  font-weight: 500;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  background-color: transparent;
  color: #4d4d4d;

  &.selected {
    text-decoration: none;
    font-weight: bold;
  }
`;

export const ClearLink = styled.button`
  margin-left: -20px;
  height: 34px;
  padding: 6px 26px;
  font-style: normal;
  font-weight: 500;
  border: none;
  border-radius: 5px;
  text-decoration: underline;
  background-color: transparent;
  color: #4d4d4d;
`;
