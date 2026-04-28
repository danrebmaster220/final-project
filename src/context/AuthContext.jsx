import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firestoreProfile, setFirestoreProfile] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setFirestoreProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Fetch Firestore profile
  async function fetchProfile(uid) {
    try {
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        setFirestoreProfile(docSnap.data());
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }

  // Refresh profile (call after updates in SettingsPage)
  async function refreshProfile() {
    if (user) {
      await fetchProfile(user.uid);
    }
  }

  // Login with email and password
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Register with email, password, and profile data
  async function register(email, password, profileData) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    const displayName = profileData.middleName
      ? `${profileData.firstName} ${profileData.middleName} ${profileData.lastName}`
      : `${profileData.firstName} ${profileData.lastName}`;

    await updateProfile(newUser, { displayName });

    await setDoc(doc(db, "users", newUser.uid), {
      firstName: profileData.firstName,
      middleName: profileData.middleName || "",
      lastName: profileData.lastName,
      email: email,
      photoURL: "",
      createdAt: serverTimestamp(),
    });

    await fetchProfile(newUser.uid);
    return userCredential;
  }

  // Login with Google OAuth
  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const googleUser = result.user;

    await setDoc(
      doc(db, "users", googleUser.uid),
      {
        firstName: googleUser.displayName?.split(" ")[0] || "",
        middleName: "",
        lastName: googleUser.displayName?.split(" ").slice(1).join(" ") || "",
        email: googleUser.email,
        photoURL: googleUser.photoURL || "",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    await fetchProfile(googleUser.uid);
    return result;
  }

  // Logout
  function logout() {
    setFirestoreProfile(null);
    return signOut(auth);
  }

  const value = {
    user,
    loading,
    firestoreProfile,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
