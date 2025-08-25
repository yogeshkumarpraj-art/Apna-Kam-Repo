// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "apna-kaushal",
  appId: "1:987931687385:web:55ed647282dfb280ed01c8",
  storageBucket: "apna-kaushal.firebasestorage.app",
  apiKey: "AIzaSyBwgK64Y2VQTYQtaSqFj2HEncu31RiZzig",
  authDomain: "apna-kaushal.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "987931687385",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
