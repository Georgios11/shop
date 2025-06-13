import styled from 'styled-components';

export const CategoriesContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

export const CategoriesHeader = styled.h2`
  color: var(--color-grey-700);
  margin-bottom: 2rem;
  text-align: center;
`;

export const CategoriesGrid = styled.div`
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

export const CategoryCard = styled.div`
  background: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

export const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-grey-100);
`;

export const CategoryName = styled.h3`
  color: var(--color-grey-700);
  font-size: 1.2rem;
  text-transform: capitalize;
`;

interface CategoryStatusProps {
  $isDiscounted: boolean;
}

export const CategoryStatus = styled.span<CategoryStatusProps>`
  padding: 0.4rem 1rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${(props) =>
    props.$isDiscounted ? 'var(--color-green-100)' : 'var(--color-grey-100)'};
  color: ${(props) =>
    props.$isDiscounted ? 'var(--color-green-700)' : 'var(--color-grey-700)'};
`;

export const CategoryInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-grey-500);

  span {
    display: flex;
    justify-content: space-between;
  }
`;

export const ProductCount = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-grey-100);
  font-weight: 500;
  color: var(--color-blue-700);
  text-align: right;
`;

export const CategoryActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

export const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  flex: 1;

  &.edit {
    background-color: var(--color-blue-100);
    color: var(--color-blue-700);

    &:hover {
      background-color: var(--color-blue-200);
    }
  }

  &.delete {
    background-color: var(--color-red-100);
    color: var(--color-red-700);

    &:hover {
      background-color: var(--color-red-200);
    }
  }
`;
