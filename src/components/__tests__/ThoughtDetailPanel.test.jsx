import { render, fireEvent, screen } from '@testing-library/react';
import ThoughtDetailPanel from '../ThoughtDetailPanel';

describe('ThoughtDetailPanel', () => {
  const mockThought = {
    thought_bubble_id: '01HN5G4K8PMXQ0VGWX7CTBZ3YR',
    title: 'Test Thought',
    description: 'Test description',
    segments: [
      {
        segment_id: '01HN5G4K8PMXQ0VGWX7CTBZ3YS',
        title: 'Test Segment',
        content: 'Test content',
        fields: {
          type: 'note',
          location: 'home',
        },
      },
    ],
    tags: [{ name: 'test', color: '#10b981' }],
  };

  const mockSetThoughts = jest.fn();

  test('renders thought details correctly', () => {
    render(
      <ThoughtDetailPanel thought={mockThought} setThoughts={mockSetThoughts} />
    );

    expect(screen.getByDisplayValue('Test Thought')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Test Segment')).toBeInTheDocument();
  });

  test('displays segment fields', () => {
    render(
      <ThoughtDetailPanel thought={mockThought} setThoughts={mockSetThoughts} />
    );

    expect(screen.getByText('type:')).toBeInTheDocument();
    expect(screen.getByText('note')).toBeInTheDocument();
    expect(screen.getByText('location:')).toBeInTheDocument();
    expect(screen.getByText('home')).toBeInTheDocument();
  });

  test('shows tags with correct colors', () => {
    render(
      <ThoughtDetailPanel thought={mockThought} setThoughts={mockSetThoughts} />
    );

    const tag = screen.getByText('test');
    expect(tag).toHaveStyle({ backgroundColor: '#10b981' });
  });

  test('updates thought when edited', () => {
    render(
      <ThoughtDetailPanel thought={mockThought} setThoughts={mockSetThoughts} />
    );

    const titleInput = screen.getByDisplayValue('Test Thought');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    expect(mockSetThoughts).toHaveBeenCalled();
    expect(mockSetThoughts).toHaveBeenCalledWith(expect.any(Function));
  });
});
