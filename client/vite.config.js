import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/solve': 'http://localhost:3002',
    },
  },
  build: {
    outDir: 'dist',
  },
});
