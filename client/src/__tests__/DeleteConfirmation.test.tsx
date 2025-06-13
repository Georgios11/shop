import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DeleteConfirmation from '../components/DeleteConfirmation';

describe('DeleteConfirmation', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();
  const resourceName = 'Task';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with the correct resource name', () => {
    render(
      <DeleteConfirmation
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        resourceName={resourceName}
      />
    );

    expect(screen.getByText(`Delete ${resourceName}`)).toBeInTheDocument();
    expect(
      screen.getByText(
        `Are you sure you want to delete this ${resourceName.toLowerCase()}?`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('This action cannot be undone.')
    ).toBeInTheDocument();
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <DeleteConfirmation
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        resourceName={resourceName}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Delete button is clicked', () => {
    render(
      <DeleteConfirmation
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        resourceName={resourceName}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });
});
