import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
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

  async function fetchProfile(uid) {
    try {
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        setFirestoreProfile(docSnap.data());
      } else {
        console.warn("No Firestore profile found for uid:", uid);
        setFirestoreProfile(null);
      }
    } catch (err) {
      console.error("Error fetching profile (check Firestore rules):", err);
      setFirestoreProfile(null);
    }
  }

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

    // Send email verification
    await sendEmailVerification(newUser);

    return userCredential;
  }

  // Login with Google OAuth
  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const googleUser = result.user;

    const existingDoc = await getDoc(doc(db, "users", googleUser.uid));

    if (existingDoc.exists()) {
      await setDoc(
        doc(db, "users", googleUser.uid),
        {
          firstName: googleUser.displayName?.split(" ")[0] || "",
          lastName: googleUser.displayName?.split(" ").slice(1).join(" ") || "",
          email: googleUser.email,
        },
        { merge: true }
      );
    } else {
      await setDoc(doc(db, "users", googleUser.uid), {
        firstName: googleUser.displayName?.split(" ")[0] || "",
        middleName: "",
        lastName: googleUser.displayName?.split(" ").slice(1).join(" ") || "",
        email: googleUser.email,
        photoURL: googleUser.photoURL || "",
        createdAt: serverTimestamp(),
      });
    }

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
