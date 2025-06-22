
import React from 'react';
import { render, screen, debug } from '@testing-library/react';
import { vi } from 'vitest';
import AddThoughtModal from '../AddThoughtModal';

// Minimal test to understand what's happening during render
describe('Component Rendering Debug', () => {
  test('diagnostic: what actually renders from AddThoughtModal', () => {
    const mockProps = {
      isVisible: true,
      onClose: vi.fn(),
      onAddThought: vi.fn(),
      existingThoughts: []
    };

    console.log('=== BEFORE RENDER ===');
    console.log('React version:', React.version);
    console.log('Props:', mockProps);

    const result = render(<AddThoughtModal {...mockProps} />);
    
    console.log('=== AFTER RENDER ===');
    console.log('Container HTML:', result.container.innerHTML);
    console.log('Document body:', document.body.innerHTML);
    
    // Use debug() to see what RTL thinks is rendered
    debug();
    
    // Check if ANY elements exist
    const allElements = result.container.querySelectorAll('*');
    console.log('Total elements found:', allElements.length);
    allElements.forEach((el, i) => {
      console.log(`Element ${i}:`, el.tagName, el.className, el.textContent);
    });

    // This test should fail but give us useful info
    expect(result.container.innerHTML).not.toBe('');
  });

  test('diagnostic: simple div rendering test', () => {
    const TestComponent = () => <div data-testid="test-div">Hello World</div>;
    
    console.log('=== SIMPLE COMPONENT TEST ===');
    const result = render(<TestComponent />);
    console.log('Simple component HTML:', result.container.innerHTML);
    debug();
    
    expect(screen.getByTestId('test-div')).toBeInTheDocument();
  });
});
