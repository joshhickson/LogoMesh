import { render, fireEvent, screen } from '@testing-library/react';
import ThoughtDetailPanel from '../ThoughtDetailPanel';

describe('ThoughtDetailPanel', () => {
  const mockThought = {
    id: '1',
    title: 'Test Thought',
    content: 'Test content'
  };

  const mockProps = {
    thought: mockThought,
    onUpdate: vi.fn(),
    onClose: vi.fn()
  };

  test('renders thought details', () => {
    render(<ThoughtDetailPanel {...mockProps} />);

    expect(screen.getByText('Test Thought')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('handles close action', () => {
    render(<ThoughtDetailPanel {...mockProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });
});