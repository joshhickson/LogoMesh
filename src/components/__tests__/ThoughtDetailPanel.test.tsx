/// <reference types="vitest" />
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ThoughtDetailPanel from '../ThoughtDetailPanel';
import '@testing-library/jest-dom';
import { Thought } from '@contracts/entities';

describe('ThoughtDetailPanel', () => {
  const mockThought: Thought = {
    id: '1',
    title: 'Test Thought',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    segments: [{
      segment_id: '1',
      thought_bubble_id: '1',
      title: 'Test Segment',
      content: 'Test content',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fields: {},
    }],
  };

  const mockProps = {
    thought: mockThought,
    onClose: vi.fn(),
    onUpdate: vi.fn(),
  };

  test('renders thought details', () => {
    render(<ThoughtDetailPanel {...mockProps} />);

    expect(screen.getByText('Test Thought')).toBeInTheDocument();
    // Look for content in the paragraph element specifically
    expect(screen.getByDisplayValue('Test content')).toBeInTheDocument();
  });

  test('handles close action', () => {
    render(<ThoughtDetailPanel {...mockProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });
});