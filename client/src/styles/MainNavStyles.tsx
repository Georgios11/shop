import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

export const Header = styled.header`
  min-height: 15vh;
  background-color: var(--color-brand-900);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 9999;

  @media (max-width: 768px) {
    align-items: flex-start;
    width: 100%;
  }
`;

export const Nav = styled.nav`
  padding: 1rem;
  width: 100%;
`;

interface NavListProps {
  $isOpen: boolean;
}

export const NavList = styled.ul<NavListProps>`
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
    width: 100%;
    padding: 0.5rem;
    box-sizing: border-box;
  }

  @media (min-width: 769px) {
    display: flex;
    width: auto;
    padding: 0;
    gap: 1rem;
  }
`;

export const StyledNavLink = styled(NavLink)`
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 1.2rem;

    color: var(--color-brand-50);
    font-size: 1.6rem;
    font-weight: 500;
    padding: 1.2rem 2.4rem;
    text-decoration: none;

    @media (max-width: 768px) {
      font-size: 1.4rem;
      padding: 0.8rem;
      width: 100%;
      box-sizing: border-box;
    }
  }

  &:hover,
  &:active,
  &.active {
    color: var(--color-brand-200);
    background-color: var(--color-brand-700);
    border-radius: var(--border-radius-sm);
  }
`;

export const MenuButton = styled.button`
  background-color: transparent;
  border: none;
  color: var(--color-brand-50);
  font-size: 2rem;
  cursor: pointer;

  @media (min-width: 769px) {
    display: none;
  }
`;

export const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1.2rem;

  color: var(--color-brand-50);
  font-size: 1.6rem;
  font-weight: 500;
  padding: 1.2rem 2.4rem;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;

  @media (max-width: 768px) {
    font-size: 1.4rem;
    padding: 0.8rem;
    width: 100%;
    box-sizing: border-box;
  }

  &:hover,
  &:active,
  &:focus {
    color: var(--color-brand-200);
    background-color: var(--color-brand-700);
    border-radius: var(--border-radius-sm);
    outline: none;
  }
`;
