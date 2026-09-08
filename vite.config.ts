import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_TARGET = process.env.VITE_API_PROXY || 'http://localhost:4000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      // The local CodeQuest API (server/). Same-origin in dev, so no CORS dance.
      '/api': {
        target: API_TARGET,
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          confetti: ['canvas-confetti']
        }
      }
    }
  }
});
