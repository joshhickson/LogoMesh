import { vi } from 'vitest';

describe('Mock Analysis', () => {
  test('check what mocks are active', () => {
    console.log('=== ACTIVE MOCKS ANALYSIS ===');

    // Check if our mocks are working
    console.log('vi.isMockFunction(React.createElement):', vi.isMockFunction(React.createElement));

    // Check global objects
    console.log('window object keys:', Object.keys(window).filter(k => k.includes('mock') || k.includes('Mock')));
    console.log('global object keys:', Object.keys(global).filter(k => k.includes('mock') || k.includes('Mock')));

    // Check if any setup files are interfering
    console.log('document.body:', document.body);
    console.log('document.createElement type:', typeof document.createElement);

    // Check React setup
    const React = require('react');
    console.log('React object keys:', Object.keys(React));
    console.log('React.version:', React.version);

    expect(true).toBe(true); // Always pass, just for logging
  });

  test('React import analysis', () => {
    const React = require('react');

    expect(React).toBeDefined();
    expect(React.createElement).toBeInstanceOf(Function);
  });

  test('React import timing analysis', async () => {
    // Test React import timing with proper async handling
    const React = await import('react');
    expect(React.default || React).toBeDefined();
    expect((React.default || React).createElement).toBeTypeOf('function');
  });
});