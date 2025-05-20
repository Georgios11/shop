import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../pages/Home';

describe('Home page', () => {
  test('renders the home page', () => {
    render(<Home />);
    screen.debug();
    const element = screen.getByText(/home/i);
    expect(element).toBeInTheDocument();
  });
});
