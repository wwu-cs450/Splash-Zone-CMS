// Set Firebase config environment variables (dummy values for emulator)
process.env.VITE_FIREBASE_API_KEY = "test-api-key";
process.env.VITE_FIREBASE_AUTH_DOMAIN = "test-auth-domain";
process.env.VITE_FIREBASE_PROJECT_ID = "test-project-id";
process.env.VITE_FIREBASE_STORAGE_BUCKET = "test-storage-bucket";
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = "test-sender-id";
process.env.VITE_FIREBASE_APP_ID = "test-app-id";
process.env.VITE_FIREBASE_MEASUREMENT_ID = "test-measurement-id";

// Set environment variables for Firebase emulator
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
