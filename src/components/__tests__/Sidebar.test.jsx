import { render, fireEvent, screen } from '@testing-library/react';
import Sidebar from '../Sidebar';

describe('Sidebar', () => {
  const mockThoughts = [
    {
      thought_bubble_id: 'test-1',
      title: 'Philosophy Thought',
      segments: [
        {
          segment_id: 'seg-1',
          title: 'Logic',
          fields: { type: 'concept', domain: 'philosophy' },
        },
      ],
    },
    {
      thought_bubble_id: 'test-2',
      title: 'AI Thought',
      segments: [
        {
          segment_id: 'seg-2',
          title: 'Neural Networks',
          fields: { type: 'technology', domain: 'AI' },
        },
      ],
    },
  ];

  const mockProps = {
    thoughts: mockThoughts,
    setThoughts: jest.fn(),
    setSelectedThought: jest.fn(),
    setShowModal: jest.fn(),
    toggleDarkMode: jest.fn(),
    setActiveFilters: jest.fn(),
  };

  test('renders all thoughts initially', () => {
    render(<Sidebar {...mockProps} />);
    expect(screen.getByText('Philosophy Thought')).toBeInTheDocument();
    expect(screen.getByText('AI Thought')).toBeInTheDocument();
  });

  test('filters thoughts based on field name', () => {
    render(<Sidebar {...mockProps} />);
    const select = screen.getByRole('combobox', { multiple: true });
    fireEvent.change(select, { target: { value: 'domain' } });
    expect(mockProps.setActiveFilters).toHaveBeenCalled();
  });

  test('resets filters when reset button clicked', () => {
    render(<Sidebar {...mockProps} />);
    const resetButton = screen.getByText('Reset Filters');
    fireEvent.click(resetButton);
    expect(mockProps.setActiveFilters).toHaveBeenCalledWith([]);
  });

  test('opens add thought modal when button clicked', () => {
    render(<Sidebar {...mockProps} />);
    const addButton = screen.getByText('Add New Thought');
    fireEvent.click(addButton);
    expect(mockProps.setShowModal).toHaveBeenCalledWith(true);
  });
});
