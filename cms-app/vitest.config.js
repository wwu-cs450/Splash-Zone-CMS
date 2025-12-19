import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/api/**/*.js'],
      exclude: ['src/api/firebaseconfig.js', 'node_modules/'],
    },
    testTimeout: 10000,
  },
});
