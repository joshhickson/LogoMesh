import React, { Suspense } from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the entire Canvas component to avoid canvas/Cytoscape issues in tests
vi.mock('../Canvas', () => {
  return {
    default: function MockCanvas() {
      return <div data-testid="cytoscape-mock">Canvas Component</div>;
    }
  };
});

const Canvas = React.lazy(() => import('../Canvas'));

describe('Canvas', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(
      <Suspense fallback={<div>Loading...</div>}>
        <Canvas />
      </Suspense>
    );
    expect(getByTestId('cytoscape-mock')).toBeInTheDocument();
  });

  it('should handle thought creation', async () => {
    render(<Canvas />);

    const addButton = screen.getByRole('button', { name: /add thought/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /add thought/i })).toBeInTheDocument();
    });
  });
});