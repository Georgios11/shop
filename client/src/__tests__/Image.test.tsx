import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Image from '../components/Image';

describe('Image Component', () => {
  it('renders with default alt text when no alt is provided', () => {
    render(<Image src="/test-image.jpg" />);
    expect(screen.getByAltText('Image')).toBeInTheDocument();
  });

  it('renders with provided alt text', () => {
    render(<Image src="/test-image.jpg" alt="Test alt text" />);
    expect(screen.getByAltText('Test alt text')).toBeInTheDocument();
  });

  it('uses default placeholder when no src is provided', () => {
    render(<Image />);
    const image = screen.getByAltText('Image');
    expect(image.getAttribute('src')).toBe('/default-placeholder.png');
  });

  it('shows placeholder before image loads', () => {
    render(<Image src="/test-image.jpg" />);
    const placeholder = document.querySelector('[data-testid="placeholder"]');
    expect(placeholder).toHaveStyle({ opacity: '1' });
  });

  it('hides placeholder and shows image after loading', async () => {
    render(<Image src="/test-image.jpg" />);
    const image = screen.getByAltText('Image');

    // Simulate image load
    image.dispatchEvent(new Event('load'));

    // Wait for state update to propagate
    await screen.findByAltText('Image');

    const placeholder = screen.getByTestId('placeholder');
    expect(placeholder).toHaveStyle('opacity: 0');
    expect(image).toHaveStyle('opacity: 1');
  });
});
