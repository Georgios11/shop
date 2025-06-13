import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import UserDashboard from '../pages/user/UserDashboard';

// Mock components for the routes
const Profile = () => <div data-testid="profile-content">Profile Content</div>;
const Orders = () => <div data-testid="orders-content">Orders Content</div>;
const Favorites = () => (
  <div data-testid="favorites-content">Favorites Content</div>
);

const renderWithRouter = (initialRoute: string) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/user" element={<UserDashboard />}>
          <Route index element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="favorites" element={<Favorites />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe('UserDashboard component', () => {
  it('renders the dashboard with sidebar navigation', () => {
    renderWithRouter('/user');

    // Check if the dashboard container is rendered
    expect(screen.getByTestId('user-dashboard-page')).toBeInTheDocument();

    // Check if all navigation links are present
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });

  it('displays the profile content by default', () => {
    renderWithRouter('/user');

    // Check if profile content is rendered
    expect(screen.getByTestId('profile-content')).toBeInTheDocument();

    // Check if the profile link has the active class
    const profileLink = screen.getByText('Profile').closest('a');
    expect(profileLink).toHaveClass('active');

    // Other links should not have the active class
    const ordersLink = screen.getByText('Orders').closest('a');
    const favoritesLink = screen.getByText('Favorites').closest('a');
    expect(ordersLink).not.toHaveClass('active');
    expect(favoritesLink).not.toHaveClass('active');
  });

  it('displays orders content when navigated to orders route', () => {
    renderWithRouter('/user/orders');

    // Check if orders content is rendered
    expect(screen.getByTestId('orders-content')).toBeInTheDocument();

    // Check if the orders link has the active class
    const ordersLink = screen.getByText('Orders').closest('a');
    expect(ordersLink).toHaveClass('active');

    // Other links should not have the active class
    const profileLink = screen.getByText('Profile').closest('a');
    const favoritesLink = screen.getByText('Favorites').closest('a');
    expect(profileLink).not.toHaveClass('active');
    expect(favoritesLink).not.toHaveClass('active');
  });

  it('displays favorites content when navigated to favorites route', () => {
    renderWithRouter('/user/favorites');

    // Check if favorites content is rendered
    expect(screen.getByTestId('favorites-content')).toBeInTheDocument();

    // Check if the favorites link has the active class
    const favoritesLink = screen.getByText('Favorites').closest('a');
    expect(favoritesLink).toHaveClass('active');

    // Other links should not have the active class
    const profileLink = screen.getByText('Profile').closest('a');
    const ordersLink = screen.getByText('Orders').closest('a');
    expect(profileLink).not.toHaveClass('active');
    expect(ordersLink).not.toHaveClass('active');
  });
});
