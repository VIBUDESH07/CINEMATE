// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import getAuth for authentication
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_GdNw5Roq-0FFQG-q-Fn8iCvyHAPb8Bk",
  authDomain: "movie-f8c38.firebaseapp.com",
  projectId: "movie-f8c38",
  storageBucket: "movie-f8c38.appspot.com",
  messagingSenderId: "117322201133",
  appId: "1:117322201133:web:08d32dfa1f3446c20e20a4",
  measurementId: "G-EDN2MBC6B7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app); // Export auth instance
