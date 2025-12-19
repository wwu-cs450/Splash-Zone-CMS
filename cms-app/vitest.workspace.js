import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './vitest.config.js',
    test: {
      name: 'node',
      environment: 'node',
      include: ['src/tests/firebase-*.test.js', 'src/api/**/*.test.js'],
      setupFiles: ['./vitest.setup.node.js'],
      globals: true,
    },
  },
  {
    extends: './vitest.config.js',
    test: {
      name: 'jsdom',
      environment: 'jsdom',
      include: ['src/**/*.test.{jsx,tsx}', 'src/tests/members-context.test.js'],
      setupFiles: ['./vitest.setup.jsdom.js'],
      globals: true,
    },
  },
]);
