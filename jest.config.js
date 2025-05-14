
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '@core/(.*)': '<rootDir>/core/$1',
    '@contracts/(.*)': '<rootDir>/contracts/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/core/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/core/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ]
};
