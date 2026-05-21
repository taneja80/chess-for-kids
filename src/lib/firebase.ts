import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';

// =================================================================
// IMPORTANT: Replace these values with your own Firebase project config
// from https://console.firebase.google.com
// =================================================================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyPlaceholder",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "placeholder.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://placeholder-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "placeholder",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "placeholder.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:placeholder",
};

// Initialize app (safe on server and client)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Only initialize services on the client to prevent SSR build errors
// if environment variables are missing or malformed.
export const auth = typeof window !== 'undefined' ? getAuth(app) : null as unknown as Auth;
export const db = typeof window !== 'undefined' ? getFirestore(app) : null as unknown as Firestore;
export const rtdb = typeof window !== 'undefined' ? getDatabase(app) : null as unknown as Database;

export default app;
