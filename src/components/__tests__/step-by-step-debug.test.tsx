/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect } from 'vitest';

describe('Step by Step Component Debug', () => {
  test('Step 1: Raw HTML rendering', () => {
    const html = '<div data-testid="raw-html">Raw HTML Test</div>';
    document.body.innerHTML = html;
    
    expect(document.querySelector('[data-testid="raw-html"]')).toBeTruthy();
    console.log('✅ Raw HTML works');
  });

  test('Step 2: React.createElement direct', () => {
    const element = React.createElement('div', { 'data-testid': 'react-element' }, 'React Element Test');
    const result = render(element);
    
    console.log('createElement result HTML:', result.container.innerHTML);
    expect(screen.getByTestId('react-element')).toBeInTheDocument();
    console.log('✅ React.createElement works');
  });

  test('Step 3: Simple functional component', () => {
    const SimpleComponent = () => {
      console.log('SimpleComponent rendering...');
      return React.createElement('div', { 'data-testid': 'simple-component' }, 'Simple Component Test');
    };
    
    const result = render(React.createElement(SimpleComponent));
    console.log('Simple component HTML:', result.container.innerHTML);
    expect(screen.getByTestId('simple-component')).toBeInTheDocument();
    console.log('✅ Simple functional component works');
  });

  test('Step 4: Component with JSX', () => {
    const JSXComponent = () => {
      console.log('JSXComponent rendering...');
      return <div data-testid="jsx-component">JSX Component Test</div>;
    };
    
    const result = render(<JSXComponent />);
    console.log('JSX component HTML:', result.container.innerHTML);
    expect(screen.getByTestId('jsx-component')).toBeInTheDocument();
    console.log('✅ JSX component works');
  });
});
