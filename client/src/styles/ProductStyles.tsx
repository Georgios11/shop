import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
  flex: 1;
`;

export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
  padding: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    padding: 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }
`;

export const ProductLink = styled(Link)`
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
`;

export const FavoriteIcon = styled(FaHeart)`
  position: absolute;
  top: 15px;
  right: 15px;
  color: #ff69b4;
  font-size: 1.5rem;
  z-index: 1;
`;

interface ProductProps {
  $itemsInStock: number;
}

export const Product = styled.div<ProductProps>`
  position: relative;
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
  overflow: visible;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 0.75rem;

    &:hover {
      transform: none; // Disable hover effect on mobile
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
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
    color: #333333;
    margin-bottom: 0.25rem;

    &.price {
      font-size: 1.125rem;
      font-weight: bold;
      color: #0056b3;
      margin-top: auto;
    }

    &.description {
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
      color: #666;
      line-height: 1.6;
      word-break: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }

    &.stock {
      font-size: 1rem;
      font-weight: bold;
      color: ${({ $itemsInStock }) =>
        $itemsInStock > 0 ? '#1a7431' : '#ab1e2c'};
    }

    &.likes {
      font-size: 1rem;
      color: #1a7431;
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

export const SearchInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 1rem 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 1.5rem 0;
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  background-color: white;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
  }
`;
