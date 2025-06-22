import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Canvas from '../Canvas';

// Mock cytoscape and its extensions
vi.mock('cytoscape', () => ({
  default: vi.fn(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    elements: vi.fn(() => ({ remove: vi.fn() })),
    layout: vi.fn(() => ({ run: vi.fn() })),
    fit: vi.fn(),
    zoom: vi.fn(),
    center: vi.fn(),
    animate: vi.fn(),
    on: vi.fn(),
    nodes: vi.fn(() => ({
      forEach: vi.fn(),
      removeClass: vi.fn(),
      addClass: vi.fn(),
      neighborhood: vi.fn(() => ({ addClass: vi.fn() })),
      parent: vi.fn(() => ({ length: 0 })),
      union: vi.fn(),
      some: vi.fn(),
    })),
  })),
  use: vi.fn(),
}));

vi.mock('cytoscape-fcose', () => ({}));
vi.mock('cytoscape-cose-bilkent', () => ({}));

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