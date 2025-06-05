import styled from 'styled-components';

export const ResetPasswordSection = styled.section`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-lg);
`;

export const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: var(--color-grey-600);
`;

export const Input = styled.input`
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.2rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--color-brand-600);
  }
`;
