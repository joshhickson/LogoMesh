const path = require('path');

module.exports = function override(config, env) {
  config.resolve = {
    ...config.resolve,
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@core': path.resolve(__dirname, './core'),
      '@contracts': path.resolve(__dirname, './contracts'),
      '~': path.resolve(__dirname, './src')
    }
  };
  
  // Fix react-refresh runtime import issues in development
  if (env === 'development') {
    // Disable fast refresh to avoid module resolution issues
    config.plugins = config.plugins.filter(plugin => 
      plugin.constructor.name !== 'ReactRefreshPlugin'
    );
    
    // Configure dev server to bind to all interfaces
    if (!config.devServer) {
      config.devServer = {};
    }
    config.devServer.host = '0.0.0.0';
    config.devServer.allowedHosts = 'all';
    config.devServer.port = 5000;
    
    // Remove react-refresh from babel-loader
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((oneOfRule) => {
          if (oneOfRule.loader && oneOfRule.loader.includes('babel-loader')) {
            if (oneOfRule.options && oneOfRule.options.plugins) {
              oneOfRule.options.plugins = oneOfRule.options.plugins.filter(
                plugin => !plugin.includes || !plugin.includes('react-refresh')
              );
            }
          }
        });
      }
    });
  }
  
  return config;
};
