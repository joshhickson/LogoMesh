
import { render, fireEvent } from '@testing-library/react';
import Canvas from '../Canvas';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';

cytoscape.use(coseBilkent);

jest.mock('react-cytoscapejs', () => {
  return function MockCytoscape(props) {
    return <div data-testid="cytoscape-mock" {...props} />;
  };
});

describe('Canvas', () => {
  const mockThoughts = [
    {
      thought_bubble_id: '01HN5G4K8PMXQ0VGWX7CTBZ3YT',
      title: 'Test Thought 1',
      position: { x: 100, y: 100 },
      color: '#10b981'
    },
    {
      thought_bubble_id: '01HN5G4K8PMXQ0VGWX7CTBZ3YU',
      title: 'Test Thought 2',
      position: { x: 200, y: 200 },
      color: '#3b82f6'
    }
  ];

  const mockProps = {
    thoughts: mockThoughts,
    setSelectedThought: jest.fn(),
    filteredThoughtIds: []
  };

  test('renders ReactFlow with correct nodes', () => {
    const { container } = render(<Canvas {...mockProps} />);
    const nodes = container.querySelectorAll('.react-flow__node');
    expect(nodes).toHaveLength(mockThoughts.length);
  });

  test('calls setSelectedThought when node is clicked', () => {
    const { container } = render(<Canvas {...mockProps} />);
    const firstNode = container.querySelector('.react-flow__node');
    fireEvent.click(firstNode);
    expect(mockProps.setSelectedThought).toHaveBeenCalledWith(mockThoughts[0]);
  });

  test('applies opacity based on filtered thoughts', () => {
    const { container } = render({
      ...mockProps,
      filteredThoughtIds: ['test-1']
    });
    const nodes = container.querySelectorAll('.react-flow__node');
    expect(nodes[0]).toHaveStyle({ opacity: 1 });
    expect(nodes[1]).toHaveStyle({ opacity: 0.3 });
  });
});
