import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Set Firebase config environment variables for component tests
process.env.VITE_FIREBASE_API_KEY = "test-api-key";
process.env.VITE_FIREBASE_AUTH_DOMAIN = "test-auth-domain";
process.env.VITE_FIREBASE_PROJECT_ID = "test-project-id";
process.env.VITE_FIREBASE_STORAGE_BUCKET = "test-storage-bucket";
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = "test-sender-id";
process.env.VITE_FIREBASE_APP_ID = "test-app-id";
process.env.VITE_FIREBASE_MEASUREMENT_ID = "test-measurement-id";
