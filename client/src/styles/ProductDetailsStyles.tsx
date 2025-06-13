import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const PageContainer = styled.section`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

interface ProductContainerProps {
  $windowWidth?: number;
}

export const ProductContainer = styled.div<ProductContainerProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: start;
  justify-content: center;
  padding: 2rem;
  background-color: #ffffff;
  max-width: ${({ $windowWidth }) =>
    $windowWidth && $windowWidth < 768 ? '95%' : '50%'};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

export const ProductImage = styled.img`
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: start;
  width: 100%;

  .stock-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 1rem;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

interface ActionButtonProps {
  $isFavorited?: boolean;
}

export const ActionButton = styled.button<ActionButtonProps>`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-grey-500);
  font-size: 2rem;
  transition: all 0.2s;
  padding: 0.8rem;
  border-radius: var(--border-radius-sm);

  &:hover {
    color: var(--color-brand-600);
    background-color: var(--color-grey-100);
  }

  &:disabled {
    color: var(--color-grey-300);
    cursor: not-allowed;
  }

  svg {
    color: ${(props) =>
      props.$isFavorited ? 'var(--color-pink-700)' : 'inherit'};
  }
`;

export const ProductTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
`;

export const ProductDescription = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: #666;
  line-height: 1.6;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
`;

export const ProductPrice = styled.p`
  font-size: 1.5rem;
  font-weight: bold;
  color: #2196f3;
  margin-bottom: 1rem;
`;

interface ProductStockProps {
  $inStock: number;
}

export const ProductStock = styled.p<ProductStockProps>`
  font-size: 1rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: ${({ $inStock }) => ($inStock > 0 ? '#e8f5e9' : '#ffebee')};
  color: ${({ $inStock }) => ($inStock > 0 ? '#2e7d32' : '#c62828')};
  margin-bottom: 1rem;
`;

export const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: #666;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #2196f3;
  }

  &::before {
    content: '←';
    font-size: 1.2em;
  }
`;
