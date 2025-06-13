import styled from 'styled-components';

export const StyledModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 3.2rem 4rem;
  transition: all 0.5s;
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: var(--backdrop-color);
  backdrop-filter: blur(4px);
  z-index: 1000;
  transition: all 0.5s;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 2.4rem;
`;

export const Button = styled.button`
  padding: 0.8rem 1.6rem;
  border-radius: var(--border-radius-sm);
  border: none;
  cursor: pointer;

  &.confirm {
    background-color: var(--color-red-700);
    color: var(--color-grey-0);
  }

  &.cancel {
    background-color: var(--color-grey-400);
    color: var(--color-grey-0);
  }
`;
