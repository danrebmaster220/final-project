import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Login with email and password
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Register with email, password, and profile data
  async function register(email, password, profileData) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Set display name on the Firebase Auth profile
    const displayName = profileData.middleName
      ? `${profileData.firstName} ${profileData.middleName} ${profileData.lastName}`
      : `${profileData.firstName} ${profileData.lastName}`;

    await updateProfile(newUser, { displayName });

    // Save full profile to Firestore
    await setDoc(doc(db, "users", newUser.uid), {
      firstName: profileData.firstName,
      middleName: profileData.middleName || "",
      lastName: profileData.lastName,
      email: email,
      createdAt: serverTimestamp(),
    });

    return userCredential;
  }

  // Login with Google OAuth
  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const googleUser = result.user;

    // Save to Firestore if first time
    await setDoc(
      doc(db, "users", googleUser.uid),
      {
        firstName: googleUser.displayName?.split(" ")[0] || "",
        middleName: "",
        lastName: googleUser.displayName?.split(" ").slice(1).join(" ") || "",
        email: googleUser.email,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    return result;
  }

  // Logout
  function logout() {
    return signOut(auth);
  }

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
