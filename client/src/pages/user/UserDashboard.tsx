import { NavLink, Outlet } from 'react-router-dom';
import Heading from '../../ui/Heading';
import {
  DashboardSection,
  Aside,
  DashBoardNav,
  DashboardContainer,
} from '../../styles/UserDashboardStyles';

const UserDashboard = () => {
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
