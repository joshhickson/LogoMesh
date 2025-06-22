import { render, screen } from '@testing-library/react';
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

describe('Canvas Component', () => {
  test('renders without crashing', () => {
    const { container } = render(<Canvas />);

    // Check if canvas element is rendered
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // Test canvas context mock
    expect(canvas.getContext('2d')).toBeTruthy();
  });

  test('canvas has proper dimensions', () => {
    const { container } = render(<Canvas />);
    const canvas = container.querySelector('canvas');

    expect(canvas).toHaveProperty('width');
    expect(canvas).toHaveProperty('height');
  });
});