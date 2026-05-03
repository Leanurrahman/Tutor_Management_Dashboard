// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCFfdP5fMiP89am9SOu0KB766UX6eIzRa8",
  authDomain: "bright-student-pro.firebaseapp.com",
  projectId: "bright-student-pro",
  storageBucket: "bright-student-pro.firebasestorage.app",
  messagingSenderId: "967490428301",
  appId: "1:967490428301:web:457d2a5886b5c218c431c4",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();