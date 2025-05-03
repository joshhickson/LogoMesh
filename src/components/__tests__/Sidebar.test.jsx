
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../Sidebar';

describe('Sidebar', () => {
  const mockThoughts = [
    {
      thought_bubble_id: 'test-1',
      title: 'Test Thought 1',
      segments: [{ title: 'Segment 1', fields: { type: 'test' } }]
    },
    {
      thought_bubble_id: 'test-2',
      title: 'Test Thought 2',
      segments: [{ title: 'Segment 2', fields: { type: 'other' } }]
    }
  ];

  const mockProps = {
    thoughts: mockThoughts,
    setThoughts: jest.fn(),
    setSelectedThought: jest.fn(),
    setShowModal: jest.fn(),
    toggleDarkMode: jest.fn(),
    setActiveFilters: jest.fn()
  };

  test('renders all thoughts', () => {
    render(<Sidebar {...mockProps} />);
    expect(screen.getByText('Test Thought 1')).toBeInTheDocument();
    expect(screen.getByText('Test Thought 2')).toBeInTheDocument();
  });

  test('filters thoughts correctly', () => {
    render(<Sidebar {...mockProps} />);
    const filterInput = screen.getByPlaceholderText(/filter/i);
    fireEvent.change(filterInput, { target: { value: 'Test Thought 1' } });
    
    expect(screen.getByText('Test Thought 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Thought 2')).not.toBeInTheDocument();
  });
});
