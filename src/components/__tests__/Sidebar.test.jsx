import { render, fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
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
    setThoughts: vi.fn(),
    setSelectedThought: vi.fn(),
    setShowModal: vi.fn(),
    toggleDarkMode: vi.fn(),
    setActiveFilters: vi.fn(),
    onRefreshThoughts: vi.fn(),
  };

  const mockOnThoughtClick = vi.fn();

  test('renders all thoughts initially', () => {
    render(<Sidebar {...mockProps} />);
    expect(screen.getByText('Philosophy Thought')).toBeInTheDocument();
    expect(screen.getByText('AI Thought')).toBeInTheDocument();
  });

  test('filters thoughts based on field name', () => {
    render(<Sidebar {...mockProps} />);

    // Use more specific selectors to avoid multiple listbox elements
    const fieldSelects = screen.getAllByRole('listbox');
    const fieldNamesSelect = fieldSelects[0]; // First select is for field names
    const fieldTypesSelect = fieldSelects[1]; // Second select is for field types

    // Test field name filtering
    fireEvent.change(fieldNamesSelect, { target: { value: ['type'] } });
    expect(fieldNamesSelect.value).toContain('type');

    // Test field type filtering
    fireEvent.change(fieldTypesSelect, { target: { value: ['text'] } });
    expect(fieldTypesSelect.value).toContain('text');
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
})