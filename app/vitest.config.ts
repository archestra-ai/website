/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './components'),
      '@constants': path.resolve(__dirname, './constants'),
      '@lib': path.resolve(__dirname, './lib'),
      '@mcpCatalog': path.resolve(__dirname, './app/mcp-catalog'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup-tests.ts'],
    exclude: ['node_modules', '.next', 'dist'],
  },
});
