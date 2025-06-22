import { render } from '@testing-library/react';
import { vi } from 'vitest';
import Canvas from '../Canvas';

// Mock Cytoscape with proper .use() method support
vi.mock('cytoscape', () => {
  const mockCytoscape = vi.fn(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    layout: vi.fn(() => ({ run: vi.fn() })),
    fit: vi.fn(),
    on: vi.fn(),
    nodes: vi.fn(() => ({
      forEach: vi.fn(),
      data: vi.fn(),
      position: vi.fn()
    })),
    edges: vi.fn(() => ({
      forEach: vi.fn(),
      data: vi.fn()
    })),
    destroy: vi.fn()
  }));

  // Critical: Add the .use() method for extension registration
  mockCytoscape.use = vi.fn();

  return {
    default: mockCytoscape
  };
});

// Mock cytoscape extensions
vi.mock('cytoscape-fcose', () => ({
  default: vi.fn(),
  __esModule: true
}));

vi.mock('cytoscape-cose-bilkent', () => ({
  default: vi.fn(),
  __esModule: true
}));

describe('Canvas', () => {
  const mockProps = {
    thoughts: [],
    setSelectedThought: vi.fn(),
    filteredThoughtIds: [],
    onUpdateThought: vi.fn(),
  };

  test('renders canvas container', () => {
    render(<Canvas {...mockProps} />);
    // Canvas should render a container div with cytoscape
    expect(screen.getByText('Force-Directed')).toBeInTheDocument();
  });

  test('renders with empty thoughts array', () => {
    render(<Canvas {...mockProps} />);
    // Should render without crashing with empty thoughts
    expect(screen.getByText('Hierarchical')).toBeInTheDocument();
  });
});