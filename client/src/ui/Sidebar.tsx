/* eslint-disable no-unused-vars */
import styled from 'styled-components';
import { ReactNode } from 'react';
import Logo from './Logo';
import MainNav from '../components/MainNav';

interface SidebarProps {
  children?: ReactNode;
}

const StyledSidebar = styled.aside`
  background-color: var(--color-gray-0);
  padding: 3.2rem 2.4rem;
  border-right: 1px solid var(--color-grey-0);
  grid-row: 1/-1;
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
`;

function Sidebar({ children }: SidebarProps) {
  return (
    <StyledSidebar>
      <Logo />
      <MainNav />
      {children}
    </StyledSidebar>
  );
}

export default Sidebar;
