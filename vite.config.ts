import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api/judge0': {
        target: 'https://ce.judge0.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/judge0/, '')
      }
    }
  }
});
