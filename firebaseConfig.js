import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
//import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';


const firebaseConfig = JSON.parse(process.env.EXPO_PUBLIC_FIREBASE_CONFIG)

export const FIREBASE_APP = initializeApp(firebaseConfig);
//export const ANALYTICS = getAnalytics(FIREBASE_APP);
export const FIRESTORE = getFirestore(FIREBASE_APP)
//export const FIREBASE_AUTH = getAuth(FIREBASE_APP)