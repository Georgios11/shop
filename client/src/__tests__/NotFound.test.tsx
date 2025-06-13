import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '../pages/NotFound';

describe('NotFound Component', () => {
  it('renders the not found page with correct elements', () => {
    render(<NotFound />);

    // Check if the component renders with the correct test ID
    const notFoundPage = screen.getByTestId('not-found-page');
    expect(notFoundPage).toBeInTheDocument();

    // Check if the heading is rendered correctly
    const heading = screen.getByRole('heading', { name: /NotFound/i });
    expect(heading).toBeInTheDocument();
  });
});
