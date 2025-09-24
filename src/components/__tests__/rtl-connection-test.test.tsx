
import React from 'react';
import { render, screen } from '@testing-library/react';
import { cleanup } from '@testing-library/react';

describe('RTL DOM Connection Debug', () => {
  afterEach(cleanup);

  test('diagnose RTL DOM connection', () => {
    console.log('=== RTL DOM CONNECTION TEST ===');
    
    // Render element
    const { container } = render(<div data-testid="connection-test">RTL Test</div>);
    
    console.log('Container HTML:', container.innerHTML);
    console.log('Document body HTML:', document.body.innerHTML);
    console.log('Container parent:', container.parentNode);
    console.log('Document.querySelector result:', document.querySelector('[data-testid="connection-test"]'));
    
    // Check RTL's internal DOM
    console.log('Screen debug:');
    screen.debug();
    
    // Try different query methods
    console.log('getByTestId result:', screen.queryByTestId('connection-test'));
    console.log('container.querySelector result:', container.querySelector('[data-testid="connection-test"]'));
    
    // This should work if container queries work
    expect(container.querySelector('[data-testid="connection-test"]')).toBeTruthy();
  });
});
