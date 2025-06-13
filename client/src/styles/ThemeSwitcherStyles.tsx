import styled from 'styled-components';

export const StyledSelect = styled.select`
  padding: 0.8rem 1.2rem;
  border: 1px solid var(--color-brand-200);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-brand-800);
  color: var(--color-brand-50);
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: var(--color-brand-700);
  }

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
  }

  option {
    background-color: var(--color-brand-800);
    color: var(--color-brand-50);
  }
`;
