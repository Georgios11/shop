import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import Heading from '../../ui/Heading';
import {
  DashboardSection,
  Aside,
  DashBoardNav,
  DashboardContainer,
  ContentContainer,
} from '../../styles/AdminDashBoardStyles';
import useWindowWidth from '../../hooks/useWindowWidth';
import { Section } from '../../styles/HomeStyles';
const AdminDashboard = (): React.ReactElement => {
  const location = useLocation();
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
    <DashboardSection data-testid="admin-dashboard-page">
      <Aside>
        {/* Admin Navigation */}
        <DashBoardNav>
          <NavLink
            onClick={() => {}}
            to="/admin"
            end
            style={({ isActive }) => ({
              color: isActive ? 'orangered' : 'white',
            })}
          >
            <Heading as="h3">Admin Profile</Heading>
          </NavLink>
          <NavLink
            onClick={() => {}}
            to="/admin/users"
            style={({ isActive }) => ({
              color: isActive ? 'orangered' : 'white',
            })}
          >
            <Heading as="h3">Manage Users</Heading>
          </NavLink>
          <NavLink
            end
            to="/admin/products"
            style={({ isActive }) => ({
              color: isActive ? 'orangered' : 'white',
            })}
          >
            <Heading as="h3">Manage Products</Heading>
          </NavLink>
          {/* Conditionally Render Add Product Link */}
          {location.pathname.startsWith('/admin/products') && (
            <NavLink
              to="/admin/products/add"
              style={({ isActive }) => ({
                color: isActive ? 'orangered' : 'white',
              })}
            >
              <Heading as="h4">Add Product</Heading>
            </NavLink>
          )}
          <NavLink
            end
            to="/admin/categories"
            style={({ isActive }) => ({
              color: isActive ? 'orangered' : 'white',
            })}
          >
            <Heading as="h3">Manage Categories</Heading>
          </NavLink>
          {/* Conditionally Render Add Category Link */}
          {/* {location.pathname.startsWith('/admin/categories') && (
            <NavLink
              to="/admin/categories/add"
              style={({ isActive }) => ({
                color: isActive ? 'orangered' : 'white',
              })}
            >
              <Heading as="h4">Add Category</Heading>
            </NavLink>
          )} */}
          <NavLink
            end
            to="/admin/orders"
            style={({ isActive }) => ({
              color: isActive ? 'orangered' : 'white',
            })}
          >
            <Heading as="h3">Manage Orders</Heading>
          </NavLink>
        </DashBoardNav>
      </Aside>

      <DashboardContainer>
        <Outlet />
      </DashboardContainer>
    </DashboardSection>
  );
};

export default AdminDashboard;
