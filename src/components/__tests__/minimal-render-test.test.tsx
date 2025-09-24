/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect } from 'vitest';

describe('Minimal React Rendering Test', () => {
  test('can render a basic div element', () => {
    const TestDiv = () => <div data-testid="test-element">Hello World</div>;
    
    const { container } = render(<TestDiv />);
    
    console.log('=== MINIMAL RENDER TEST ===');
    console.log('Container innerHTML:', container.innerHTML);
    console.log('Document body innerHTML:', document.body.innerHTML);
    
    // This should work if React is functioning properly
    expect(screen.getByTestId('test-element')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  test('can render with React.createElement directly', () => {
    const element = React.createElement('div', { 'data-testid': 'direct-element' }, 'Direct Element');
    
    const { container } = render(element);
    
    console.log('=== DIRECT ELEMENT TEST ===');
    console.log('Container innerHTML:', container.innerHTML);
    
    expect(screen.getByTestId('direct-element')).toBeInTheDocument();
  });
});
