import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, setLogLevel, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Suppress internal SDK connection retry warnings in iframe/sandboxed environments
try {
  setLogLevel('silent');
} catch {
  // Ignore
}

// Initialize Firebase only if config is provided
export const app = firebaseConfig.projectId
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

let firestoreInstance: Firestore | null = null;
if (app) {
  try {
    // In iframe and proxy environments, WebChannel streaming frequently fails on first attempt.
    // experimentalForceLongPolling avoids streaming failures and reliably establishes connection.
    firestoreInstance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch {
    firestoreInstance = getFirestore(app);
  }
}

export const db = firestoreInstance;
