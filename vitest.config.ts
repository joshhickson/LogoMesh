
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts', './src/setupTests.js'],
    environmentOptions: {
      jsdom: {
        resources: 'usable'
      }
    }
  },
  esbuild: {
    target: 'node14'
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
