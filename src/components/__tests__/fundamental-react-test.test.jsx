
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Fundamental React Test', () => {
  test('check if JSX transformation works', () => {
    // Test 1: Direct JSX
    console.log('=== TESTING JSX TRANSFORMATION ===');
    const jsxElement = <div>JSX Test</div>;
    console.log('JSX element:', jsxElement);
    
    // Test 2: React.createElement
    const createElementTest = React.createElement('div', null, 'createElement Test');
    console.log('createElement result:', createElementTest);
    
    // Test 3: Render and check
    const { container } = render(jsxElement);
    console.log('Container after render:', container.innerHTML);
    console.log('Document body:', document.body.innerHTML);
    
    // This should pass if React is working
    expect(container.firstChild).toBeTruthy();
  });

  test('check React Testing Library setup', () => {
    console.log('=== TESTING RTL SETUP ===');
    
    // Render a simple element
    render(<span data-testid="test-element">Test Content</span>);
    
    // Check if RTL can find it
    const element = screen.queryByTestId('test-element');
    console.log('Found element:', element);
    console.log('Element innerHTML:', element ? element.innerHTML : 'NOT FOUND');
    
    expect(element).toBeTruthy();
  });
});
