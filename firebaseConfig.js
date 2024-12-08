import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth } from 'firebase/auth';


EXPO_PUBLIC_FIREBASE_CONFIG={
  apiKey: "AIzaSyDx-RPzH-UjI9NuZO-8D5zxf3aK4cDiXtk",
  authDomain: "beerdb-78204.firebaseapp.com",
  projectId: "beerdb-78204",
  storageBucket: "beerdb-78204.firebasestorage.app",
  messagingSenderId: "327987095565",
  appId: "1:327987095565:web:cd236e3fe007e376274d44",
  measurementId: "G-2YL1R07H4N"
}

const firebaseConfig = EXPO_PUBLIC_FIREBASE_CONFIG

export const FIREBASE_APP = initializeApp(firebaseConfig);
//export const ANALYTICS = getAnalytics(FIREBASE_APP);
export const FIRESTORE = getFirestore(FIREBASE_APP)
export const FIREBASE_AUTH = initializeAuth( FIREBASE_APP )