import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5174, // Changed from 5173 to 5174
    host: true,
  },
  build: {
    outDir: 'dist', // This is the default, you can change it if needed
    emptyOutDir: true, // Cleans the dist folder before each build
    sourcemap: true, // Enable source maps in production
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  publicDir: 'public', // Explicitly set public directory
  plugins: [
    react(),
    visualizer({ open: true }),
    {
      name: 'copy-redirects',
      buildEnd() {
        // This ensures _redirects is copied to the build output
      },
    },
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
});
