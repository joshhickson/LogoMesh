/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js', './vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,ts,jsx,tsx}', 'core/**/*.{js,ts,jsx,tsx}', 'server/src/**/*.{js,ts,jsx,tsx}'],
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
      reporter: ['text', 'html', 'json-summary', 'json'],
      thresholds: {
        global: {
          lines: 85,
          branches: 80,
          functions: 90,
          statements: 85,
        },
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
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@server': path.resolve(__dirname, './server/src'),
      '@core': path.resolve(__dirname, './core'),
      '@contracts': path.resolve(__dirname, './contracts'),
    },
  },
});
