import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/__tests__/**/*.test.{js,ts}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', '../core/**/*.ts'],
      exclude: ['src/types/**', '**/*.d.ts', '**/index.ts', '../contracts/**'],
      reporter: ['text', 'html', 'json-summary', 'json'],
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
