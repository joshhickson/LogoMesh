import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['../vitest.setup.ts'],
    include: ['src/**/__tests__/**/*.test.{js,ts}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/types/**', '**/*.d.ts', '**/index.ts'],
      reporter: ['text', 'html', 'json-summary', 'json'],
      thresholds: {
        global: {
          lines: 85,
          branches: 80,
          functions: 90,
          statements: 85,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, '../core'),
      '@contracts': path.resolve(__dirname, '../contracts'),
      '@server': path.resolve(__dirname, './src'),
    },
  },
});
