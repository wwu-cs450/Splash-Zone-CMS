// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Use import.meta.env in Vite, fall back to process.env in Jest
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : process.env;

const firebaseConfig = {
 apiKey: env.VITE_FIREBASE_API_KEY,
 authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
 projectId: env.VITE_FIREBASE_PROJECT_ID,
 storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
 messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
 appId: env.VITE_FIREBASE_APP_ID,
 measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);


if (env.DEV) {
   const auth = getAuth(app);
   connectAuthEmulator(auth, "http://localhost:9099");
   connectFirestoreEmulator(getFirestore(app), "localhost", 8080);
   console.log("Firebase auth emulator connected 9099");
   console.log("Firebase firestore emulator connected 8080");
}


export default app;