/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use 'node' for backend tests and 'jsdom' for frontend component tests.
    // This can be overridden on a per-file basis using docblock comments.
    environment: 'jsdom',

    // Enable Jest-compatible globals (describe, test, expect, etc.) for ease of use.
    globals: true,

    // Path to a setup file that runs before each test file.
    setupFiles: ['./src/setupTests.js', './vitest.setup.ts'],

    // Configure code coverage reporting.
    coverage: {
      // Use the 'v8' provider for performance. It's built into Node.js.
      provider: 'v8',

      // Specify which files to include in the coverage report using glob patterns.
      include: ['src/**/*.{js,ts,jsx,tsx}', 'core/**/*.{js,ts,jsx,tsx}', 'server/src/**/*.{js,ts,jsx,tsx}'],

      // Exclude files that shouldn't be part of the coverage calculation.
      exclude: [
        'src/types/**',
        '**/*.d.ts',
        '**/index.ts',
        'tests/**',
        '**/__tests__/**',
        '**/__mocks__/**',
        'src/reportWebVitals.js',
        'src/setupTests.js',
        'server/src/types/**',
        'contracts/**'
      ],

      // Define the reporters for coverage output.
      // 'text' for console summary, 'html' for a detailed report, 'json' for programmatic access.
      reporter: ['text', 'html', 'json-summary', 'json'],

      // Enforce the coverage thresholds defined in the test plan.
      // The build will fail if these are not met.
      thresholds: {
        global: {
          lines: 85,
          branches: 80,
          functions: 90,
          statements: 85,
        },
        // Path-specific overrides for critical modules.
        'core/': {
          lines: 95,
          branches: 90,
          functions: 95,
          statements: 95,
        },
        'server/src/': {
            lines: 95,
            branches: 90,
            functions: 95,
            statements: 95,
        }
      },
    },
  },
  resolve: {
    // Set up path aliases to match the application's build configuration (e.g., tsconfig.json).
    // This simplifies imports in test files.
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@server': path.resolve(__dirname, './server/src'),
      '@core': path.resolve(__dirname, './core'),
      '@contracts': path.resolve(__dirname, './contracts'),
    },
  },
});
