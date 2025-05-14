
const path = require('path');

module.exports = function override(config) {
  config.resolve = {
    ...config.resolve,
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@core': path.resolve(__dirname, './core'),
      '@contracts': path.resolve(__dirname, './contracts'),
      '~': path.resolve(__dirname, './src')
    }
  };
  return config;
};
