import { Outlet, NavLink, useLocation } from 'react-router-dom';
import Heading from '../../ui/Heading';
import {
  DashboardSection,
  Aside,
  DashBoardNav,
  DashboardContainer,
} from '../../styles/AdminDashBoardStyles';

const AdminDashboard = (): React.ReactElement => {
  const location = useLocation();

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
          {location.pathname.startsWith('/admin/categories') && (
            <NavLink
              to="/admin/categories/add"
              style={({ isActive }) => ({
                color: isActive ? 'orangered' : 'white',
              })}
            >
              <Heading as="h4">Add Category</Heading>
            </NavLink>
          )}
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
