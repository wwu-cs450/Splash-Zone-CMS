import { initializeApp } from "firebase/app";

// Test Firebase configuration - uses dummy values since emulator doesn't validate
const firebaseConfig = {
  apiKey: "test-api-key",
  authDomain: "test-auth-domain",
  projectId: "test-project-id",
  storageBucket: "test-storage-bucket",
  messagingSenderId: "test-sender-id",
  appId: "test-app-id",
  measurementId: "test-measurement-id",
};

// Initialize Firebase for tests
const app = initializeApp(firebaseConfig);

export default app;
