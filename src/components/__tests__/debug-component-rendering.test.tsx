/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import AddThoughtModal from '../AddThoughtModal';
import '@testing-library/jest-dom';

describe('Debug Component Rendering', () => {
  test('AddThoughtModal renders with debug output', () => {
    const { container } = render(
      <AddThoughtModal 
        createThought={vi.fn()}
        onClose={() => {   }}
      />
    );

    // Output debug information to console for analysis
    console.log('=== DEBUG: AddThoughtModal DOM Structure ===');
    console.log(container.innerHTML);

    // Basic verification that component mounted
    expect(container.firstChild).toBeTruthy();
  });

  test('Component debug information collection', () => {
    render(<div data-testid="debug-test">Debug Test</div>);

    // Verify basic React rendering works
    expect(screen.getByTestId('debug-test')).toBeInTheDocument();
    expect(screen.getByText('Debug Test')).toBeInTheDocument();
  });
});