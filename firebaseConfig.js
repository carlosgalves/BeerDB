import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth } from 'firebase/auth';


EXPO_PUBLIC_FIREBASE_CONFIG={
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
}

const firebaseConfig = EXPO_PUBLIC_FIREBASE_CONFIG

export const FIREBASE_APP = initializeApp(firebaseConfig);
//export const ANALYTICS = getAnalytics(FIREBASE_APP);
export const FIRESTORE = getFirestore(FIREBASE_APP)
export const FIREBASE_AUTH = initializeAuth( FIREBASE_APP )