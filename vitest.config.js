const { defineConfig } = require('vitest/config');
const tsconfigPaths = require('vitest-tsconfig-paths').default;

module.exports = defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // By default, vitest searches for tests in all packages, including node_modules.
    // We explicitly only want to run tests in our source code.
    include: ['packages/**/*.test.ts', 'packages/**/*.e2e.test.ts'],
    // We also want to explicitly exclude the sample repo we downloaded.
    exclude: ['**/auth0-ai-samples/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      // The `coverage` include/exclude is for the coverage report, not the test run.
      // We are currently only measuring coverage for the storage adapter.
      include: ['packages/core/src/storage/**/*.ts'],
      all: true,
      lines: 90,
      functions: 90,
      branches: 90,
      statements: 90,
    },
  },
});
