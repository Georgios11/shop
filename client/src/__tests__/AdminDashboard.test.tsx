import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';

// Test suite for the AdminDashboard component
// Covers navigation, conditional rendering, and layout

describe('AdminDashboard', () => {
  // Test that all main navigation links are rendered
  it('renders all main navigation links', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    expect(screen.getByText(/admin profile/i)).toBeInTheDocument();
    expect(screen.getByText(/manage users/i)).toBeInTheDocument();
    expect(screen.getByText(/manage products/i)).toBeInTheDocument();
    expect(screen.getByText(/manage categories/i)).toBeInTheDocument();
    expect(screen.getByText(/manage orders/i)).toBeInTheDocument();
  });

  // Test that Add Product link is only rendered on /admin/products
  it('conditionally renders Add Product link', () => {
    // Simulate being on /admin/products
    window.history.pushState({}, '', '/admin/products');
    render(
      <MemoryRouter initialEntries={['/admin/products']}>
        <AdminDashboard />
      </MemoryRouter>
    );
    expect(screen.getByText(/add product/i)).toBeInTheDocument();
  });

  // Test that Add Product link is not rendered on other routes
  it('does not render Add Product link on other routes', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboard />
      </MemoryRouter>
    );
    expect(screen.queryByText(/add product/i)).not.toBeInTheDocument();
  });

  // Test that Add Category link is only rendered on /admin/categories
  it('conditionally renders Add Category link', () => {
    // Simulate being on /admin/categories
    window.history.pushState({}, '', '/admin/categories');
    render(
      <MemoryRouter initialEntries={['/admin/categories']}>
        <AdminDashboard />
      </MemoryRouter>
    );
    expect(screen.getByText(/add category/i)).toBeInTheDocument();
  });

  // Test that Add Category link is not rendered on other routes
  it('does not render Add Category link on other routes', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboard />
      </MemoryRouter>
    );
    expect(screen.queryByText(/add category/i)).not.toBeInTheDocument();
  });

  // Test that the dashboard section and aside are rendered
  it('renders dashboard section and aside', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboard />
      </MemoryRouter>
    );
    expect(screen.getByTestId('admin-dashboard-page')).toBeInTheDocument();
    // Aside is present (role not set, but can check by text)
    expect(screen.getByText(/admin profile/i)).toBeInTheDocument();
  });

  // (You can add more tests for navigation, outlet rendering, and access control as needed)
});
