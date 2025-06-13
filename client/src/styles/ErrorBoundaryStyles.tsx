import styled from 'styled-components';

export const StyledError = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background-color: var(--color-brand-50);
  padding: 4.8rem;
`;

export const Box = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-brand-200);
  border-radius: var(--border-radius-md);
  padding: 4.8rem;
  text-align: center;

  & h1 {
    color: var(--color-brand-700);
    margin-bottom: 1.6rem;
  }

  & p {
    color: var(--color-brand-900);
    margin-bottom: 3.2rem;
  }
`;

export const Button = styled.button`
  padding: 1.2rem 2.4rem;
  background-color: var(--color-brand-600);
  color: var(--color-grey-0);
  border: none;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  cursor: pointer;

  &:hover {
    background-color: var(--color-brand-700);
  }
`;
