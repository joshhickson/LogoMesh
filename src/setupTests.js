
import React from 'react';
import '@testing-library/jest-dom';

// Mock react-cytoscapejs
jest.mock('react-cytoscapejs', () => {
  return function MockCytoscape(props) {
    return <div data-testid="cytoscape-mock" {...props} />;
  };
});

// Mock cytoscape-cose-bilkent
jest.mock('cytoscape-cose-bilkent', () => {
  return {};
});



// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Configure test environment
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Configure Jest
jest.setTimeout(10000);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock SpeechRecognition API
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.onstart = null;
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
  }
  start() { if (this.onstart) this.onstart(); }
  stop() { if (this.onend) this.onend(); }
}

window.SpeechRecognition = MockSpeechRecognition;
window.webkitSpeechRecognition = MockSpeechRecognition;

// Configure file extensions
jest.moduleFileExtensions = ['js', 'jsx'];

// Configure transform
jest.transform = {
  '^.+\\.[tj]sx?$': 'babel-jest'
};
