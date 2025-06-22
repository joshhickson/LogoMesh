
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ThoughtDetailPanel from '../ThoughtDetailPanel';

// Mock graphService
vi.mock('../../services/graphService', () => ({
  graphService: {
    updateSegment: vi.fn().mockResolvedValue({}),
    updateFieldType: vi.fn(),
    getFieldType: vi.fn().mockReturnValue('text'),
  },
}));

describe('ThoughtDetailPanel', () => {
  const mockThought = {
    thought_bubble_id: 'test-id',
    title: 'Test Thought',
    description: 'Test Description',
    created_at: new Date().toISOString(),
    tags: [],
    segments: [],
  };

  const mockProps = {
    thought: mockThought,
    onUpdate: vi.fn(),
    refreshThoughts: vi.fn(),
  };

  test('renders thought title', () => {
    render(<ThoughtDetailPanel {...mockProps} />);
    expect(screen.getByDisplayValue('Test Thought')).toBeInTheDocument();
  });

  test('renders thought description', () => {
    render(<ThoughtDetailPanel {...mockProps} />);
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });
});
