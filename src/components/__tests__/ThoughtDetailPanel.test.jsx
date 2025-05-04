
import { render, fireEvent, screen } from '@testing-library/react';
import ThoughtDetailPanel from '../ThoughtDetailPanel';

describe('ThoughtDetailPanel', () => {
  const mockThought = {
    thought_bubble_id: 'test-1',
    title: 'Test Thought',
    description: 'Test description',
    created_at: '2023-01-01T00:00:00.000Z',
    tags: [{ name: 'test', color: '#10b981' }],
    segments: [
      {
        segment_id: 'seg-1',
        title: 'Test Segment',
        content: 'Test content',
        fields: { type: 'note' }
      }
    ]
  };

  const mockSetThoughts = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders thought details correctly', () => {
    render(<ThoughtDetailPanel thought={mockThought} setThoughts={mockSetThoughts} />);
    expect(screen.getByDisplayValue('Test Thought')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  test('updates thought title when changed', () => {
    render(<ThoughtDetailPanel thought={mockThought} setThoughts={mockSetThoughts} />);
    const titleInput = screen.getByDisplayValue('Test Thought');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    expect(mockSetThoughts).toHaveBeenCalled();
  });

  test('updates segment content when changed', () => {
    render(<ThoughtDetailPanel thought={mockThought} setThoughts={mockSetThoughts} />);
    const contentInput = screen.getByDisplayValue('Test content');
    fireEvent.change(contentInput, { target: { value: 'Updated content' } });
    expect(mockSetThoughts).toHaveBeenCalled();
  });

  test('displays created date in correct format', () => {
    render(<ThoughtDetailPanel thought={mockThought} setThoughts={mockSetThoughts} />);
    expect(screen.getByText(/Created: 1\/1\/2023/)).toBeInTheDocument();
  });
});
