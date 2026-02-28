import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
};

const hasConfig = Boolean(config.apiKey && config.projectId);

export const app: FirebaseApp | null = hasConfig
  ? (!getApps().length ? initializeApp(config) : getApps()[0])
  : null;

export function getFirebaseApp() {
  return app;
}

export function getFirebaseAuth() {
  if (!app) return null;
  return getAuth(app);
}

export function getFirebaseDb() {
  if (!app) return null;
  return getFirestore(app);
}
