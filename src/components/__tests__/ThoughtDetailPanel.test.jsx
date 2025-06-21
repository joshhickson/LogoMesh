import { render, fireEvent, screen } from '@testing-library/react';
import ThoughtDetailPanel from '../ThoughtDetailPanel';

describe('ThoughtDetailPanel', () => {
  const mockThought = {
    thought_bubble_id: 'test-id',
    title: 'Test Thought',
    description: 'Test description',
    created_at: '2023-01-01',
    tags: [{ name: 'test', color: '#10b981' }],
    segments: [{
      segment_id: 'seg-1',
      title: 'Test Segment',
      content: 'Test content',
      fields: { type: 'note', location: 'home' }
    }]
  };

  const mockSetThoughts = vi.fn();
  const mockOnUpdate = vi.fn();

  test('renders thought details correctly', () => {
    render(<ThoughtDetailPanel thought={mockThought} onUpdate={mockOnUpdate} setThoughts={mockSetThoughts} />);

    expect(screen.getByDisplayValue('Test Thought')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Segment')).toBeInTheDocument();
  });

  test('displays segment fields', () => {
    render(<ThoughtDetailPanel thought={mockThought} onUpdate={mockOnUpdate} setThoughts={mockSetThoughts} />);

    expect(screen.getByText('type:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('note')).toBeInTheDocument();
    expect(screen.getByText('location:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('home')).toBeInTheDocument();
  });

  test('shows tags with correct colors', () => {
    render(<ThoughtDetailPanel thought={mockThought} onUpdate={mockOnUpdate} setThoughts={mockSetThoughts} />);

    const tag = screen.getByText('test');
    expect(tag).toHaveStyle({ color: 'rgb(16, 185, 129)' });
  });

  test('updates thought when edited', () => {
    render(<ThoughtDetailPanel thought={mockThought} onUpdate={mockOnUpdate} setThoughts={mockSetThoughts} />);

    const titleInput = screen.getByDisplayValue('Test Thought');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    expect(mockOnUpdate).toHaveBeenCalled();
  });
});