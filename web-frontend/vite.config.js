import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/fu_auth': 'http://localhost:8002',
      '/auth': 'http://localhost:8002',
      '/companies': 'http://localhost:8002',
      '/gamification': 'http://localhost:8002',
      '/admin': 'http://localhost:8002',
      '/telemetry': 'http://localhost:8002',
    },
  },
});
