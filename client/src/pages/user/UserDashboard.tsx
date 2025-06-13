import { NavLink, Outlet, Link } from 'react-router-dom';
import Heading from '../../ui/Heading';
import {
  DashboardSection,
  Aside,
  DashBoardNav,
  DashboardContainer,
} from '../../styles/UserDashboardStyles';
import useWindowWidth from '../../hooks/useWindowWidth';
import { Section } from '../../styles/HomeStyles';
import { ContentContainer } from '../../styles/AdminDashBoardStyles';

const UserDashboard = () => {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  if (isMobile) {
    return (
      <Section>
        <ContentContainer>
          <Heading as="h3">
            Admin dashboard is available on medium and large screens only.
          </Heading>
        </ContentContainer>
        <Link to="/">Go to home page</Link>
      </Section>
    );
  }
  return (
    <DashboardSection data-testid="user-dashboard-page">
      <Aside>
        <DashBoardNav>
          <NavLink
            to="/user"
            end
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <Heading as="h3">Profile</Heading>
          </NavLink>

          <NavLink
            to="/user/orders"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <Heading as="h3">Orders</Heading>
          </NavLink>

          <NavLink
            to="/user/favorites"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <Heading as="h3">Favorites</Heading>
          </NavLink>
        </DashBoardNav>
      </Aside>

      <DashboardContainer>
        <Outlet />
      </DashboardContainer>
    </DashboardSection>
  );
};

export default UserDashboard;
