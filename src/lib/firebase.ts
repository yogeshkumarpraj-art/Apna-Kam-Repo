
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "apna-kaushal",
  appId: "1:987931687385:web:55ed647282dfb280ed01c8",
  storageBucket: "apna-kaushal.appspot.com",
  apiKey: "AIzaSyBwgK64Y2VQTYQtaSqFj2HEncu31RiZzig",
  authDomain: "apna-kaushal.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "987931687385",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
