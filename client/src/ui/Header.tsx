import styled from 'styled-components';
import { ReactNode } from 'react';

interface HeaderProps {
  children: ReactNode;
}

const StyledHeader = styled.header`
  background-color: var(--color-gray-0);
  padding: 1.2rem 4.8rem;
  border-bottom: 1px solid var(--color-grey-0);
`;

function Header({ children }: HeaderProps) {
  return <StyledHeader>{children}</StyledHeader>;
}

export default Header;
