
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

// Configure file extensions
jest.moduleFileExtensions = ['js', 'jsx'];

// Configure transform
jest.transform = {
  '^.+\\.[tj]sx?$': 'babel-jest'
};
