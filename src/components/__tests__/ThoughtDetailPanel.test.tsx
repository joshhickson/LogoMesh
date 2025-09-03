import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import ThoughtDetailPanel from '../ThoughtDetailPanel.tsx';

describe('ThoughtDetailPanel', () => {
  const mockThought = {
    thought_bubble_id: '1',
    title: 'Test Thought',
    description: 'Test content',
    created_at: new Date(),
    updated_at: new Date(),
    tags: [],
    segments: [],
  };

  const mockProps = {
    thought: mockThought,
    onUpdate: vi.fn(),
    onClose: vi.fn()
  };

  test('renders thought details', () => {
    render(<ThoughtDetailPanel {...mockProps} />);

    expect(screen.getByDisplayValue('Test Thought')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test content')).toBeInTheDocument();
  });

  test('handles close action', () => {
    render(<ThoughtDetailPanel {...mockProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });
});