import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  appType: 'spa',
  plugins: [react()],
  resolve: {
    alias: {
      '@wine-order-app/shared-types': resolve(__dirname, '../../libs/shared-types/src/index.ts'),
      '@wine-order-app/api-sdk': resolve(__dirname, '../../libs/api-sdk/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
