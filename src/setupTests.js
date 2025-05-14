import React from 'react';
import '@testing-library/jest-dom';

// Mock react-cytoscapejs with proper ES module structure
jest.mock('react-cytoscapejs', () => ({
  __esModule: true,
  default: function MockCytoscape(props) {
    return <div data-testid="cytoscape-mock" {...props} />;
  }
}));

// Mock cytoscape-cose-bilkent
jest.mock('cytoscape-cose-bilkent', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Configure Jest timeout
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

window.ResizeObserver = class ResizeObserver {
  constructor() {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
  }
};