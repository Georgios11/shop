import { useState, useEffect } from 'react';

import Heading from '../ui/Heading';
import { HiBars4 } from 'react-icons/hi2';
import { BsCart3 } from 'react-icons/bs';
import useWindowWidth from '../hooks/useWindowWidth';
import useCurrentUser from '../hooks/useCurrentUser';
import useLogout from '../hooks/useLogout';
import { User } from '../types/user';

import {
  Header,
  Nav,
  NavList,
  StyledNavLink,
  MenuButton,
  LogoutButton,
} from '../styles/MainNavStyles';

const MainNav = (): React.ReactElement => {
  const currentUser = useCurrentUser() as User | null;
  const logOut = useLogout();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const windowWidth = useWindowWidth();
  const isSmallScreen = windowWidth <= 768;

  useEffect(() => {
    if (!isSmallScreen) {
      setIsOpen(false);
    }
  }, [isSmallScreen]);

  const cart = currentUser?.cart || null;

  const totalItems =
    cart?.items?.reduce((total: number, item) => total + item.quantity, 0) || 0;

  return (
    <Header>
      <Nav>
        {isSmallScreen && (
          <MenuButton onClick={() => setIsOpen(!isOpen)}>
            <HiBars4 />
          </MenuButton>
        )}

        <NavList $isOpen={isSmallScreen ? isOpen : true}>
          <li>
            <StyledNavLink to="/" onClick={() => setIsOpen(false)}>
              <Heading as={isSmallScreen ? 'h4' : 'h2'}>Home</Heading>
            </StyledNavLink>
          </li>
          <li>
            <StyledNavLink to="/products" onClick={() => setIsOpen(false)}>
              <Heading as={isSmallScreen ? 'h4' : 'h2'}>Products</Heading>
            </StyledNavLink>
          </li>
          <li>
            <StyledNavLink to="/user" onClick={() => setIsOpen(false)}>
              <Heading as={isSmallScreen ? 'h4' : 'h2'}>User</Heading>
            </StyledNavLink>
          </li>
          <li>
            <StyledNavLink to="/admin" onClick={() => setIsOpen(false)}>
              <Heading as={isSmallScreen ? 'h4' : 'h2'}>Admin</Heading>
            </StyledNavLink>
          </li>
          {currentUser ? (
            <li>
              <LogoutButton
                onClick={() => {
                  setIsOpen(false);
                  void logOut();
                }}
              >
                <Heading as={isSmallScreen ? 'h4' : 'h2'}>Logout</Heading>
              </LogoutButton>
            </li>
          ) : (
            <li>
              <StyledNavLink to="/login" onClick={() => setIsOpen(false)}>
                <Heading as={isSmallScreen ? 'h4' : 'h2'}>Login</Heading>
              </StyledNavLink>
            </li>
          )}

          {!currentUser && (
            <li>
              <StyledNavLink to="/register" onClick={() => setIsOpen(false)}>
                <Heading as={isSmallScreen ? 'h4' : 'h2'}>Register</Heading>
              </StyledNavLink>
            </li>
          )}
          {cart && (
            <li>
              <StyledNavLink to="/cart" onClick={() => setIsOpen(false)}>
                <Heading
                  as={isSmallScreen ? 'h4' : 'h2'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <BsCart3 size={isSmallScreen ? 20 : 24} />
                  {totalItems > 0 && <span>({totalItems})</span>}
                </Heading>
              </StyledNavLink>
            </li>
          )}
        </NavList>
      </Nav>
    </Header>
  );
};

export default MainNav;
