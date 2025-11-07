// Mock import.meta.env for Vite environment variables
global.importMeta = {
  env: {
    DEV: false,
    VITE_FIREBASE_API_KEY: "test-api-key",
    VITE_FIREBASE_AUTH_DOMAIN: "test-auth-domain",
    VITE_FIREBASE_PROJECT_ID: "test-project-id",
    VITE_FIREBASE_STORAGE_BUCKET: "test-storage-bucket",
    VITE_FIREBASE_MESSAGING_SENDER_ID: "test-sender-id",
    VITE_FIREBASE_APP_ID: "test-app-id",
    VITE_FIREBASE_MEASUREMENT_ID: "test-measurement-id",
  },
};

// Set environment variables for Firebase emulator
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
