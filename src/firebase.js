import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLBVvaZEfRNiN2QErxISxUTq-F1Dljpfk",
  authDomain: "final-project-270a3.firebaseapp.com",
  projectId: "final-project-270a3",
  storageBucket: "final-project-270a3.firebasestorage.app",
  messagingSenderId: "953188412493",
  appId: "1:953188412493:web:7107a8fd5a608ed3ca8004"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
