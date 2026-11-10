import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'pv-12761141be80-4800da1b-b2e8-4207-a07b-d7958fcc4ce9.style.dev',
    ],
  },
});
