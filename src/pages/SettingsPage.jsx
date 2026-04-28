/**
 * SettingsPage — User settings with Personal Information and Security sections.
 *
 * - Profile image stored as base64 data URL in Firestore (avoids Firebase Storage upgrade)
 * - Edit/Cancel/Save toggle for each section
 * - Password change via Firebase Auth reauthenticateWithCredential + updatePassword
 * - Google-only users can link a password to enable email/password login
 */

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  linkWithCredential,
} from "firebase/auth";
import { db, auth } from "../firebase";
import Sidebar from "../components/Sidebar";
import ErrorAlert from "../components/ErrorAlert";
import PasswordChecklist from "../components/PasswordChecklist";

export default function SettingsPage() {
  const { user, refreshProfile, firestoreProfile } = useAuth();
  const fileInputRef = useRef(null);

  // Personal info state
  const [profile, setProfile] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    photoURL: "",
  });
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [personalDraft, setPersonalDraft] = useState({});
  const [personalError, setPersonalError] = useState("");
  const [personalSuccess, setPersonalSuccess] = useState("");
  const [personalLoading, setPersonalLoading] = useState(false);

  // Security state
  const [editingSecurity, setEditingSecurity] = useState(false);
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [securityError, setSecurityError] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);

  // Check auth providers
  const isGoogleUser = user?.providerData?.some((p) => p.providerId === "google.com");
  const hasPasswordProvider = user?.providerData?.some((p) => p.providerId === "password");

  // Load profile from Firestore
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const profileData = {
            firstName: data.firstName || "",
            middleName: data.middleName || "",
            lastName: data.lastName || "",
            email: user.email || "",
            photoURL: data.photoURL || user.photoURL || "",
          };
          setProfile(profileData);
          setPersonalDraft(profileData);
        } else {
          const fallback = {
            firstName: user.displayName?.split(" ")[0] || "",
            middleName: "",
            lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
          };
          setProfile(fallback);
          setPersonalDraft(fallback);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    }
    loadProfile();
  }, [user]);

  // Handle profile image upload (convert to base64)
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 200 * 1024) {
      setPersonalError("Image is too large. Please use an image under 200KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPersonalDraft((prev) => ({ ...prev, photoURL: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  // Save personal info
  async function handleSavePersonal() {
    setPersonalError("");
    setPersonalSuccess("");

    if (!personalDraft.firstName.trim() || !personalDraft.lastName.trim()) {
      setPersonalError("First name and last name are required.");
      return;
    }

    setPersonalLoading(true);
    try {
      const displayName = personalDraft.middleName.trim()
        ? `${personalDraft.firstName.trim()} ${personalDraft.middleName.trim()} ${personalDraft.lastName.trim()}`
        : `${personalDraft.firstName.trim()} ${personalDraft.lastName.trim()}`;

      const isBase64 = personalDraft.photoURL?.startsWith("data:");
      await updateProfile(auth.currentUser, {
        displayName,
        ...(isBase64 ? {} : { photoURL: personalDraft.photoURL || null }),
      });

      await setDoc(doc(db, "users", user.uid), {
        firstName: personalDraft.firstName.trim(),
        middleName: personalDraft.middleName.trim(),
        lastName: personalDraft.lastName.trim(),
        photoURL: personalDraft.photoURL || "",
      }, { merge: true });

      setProfile({ ...personalDraft });
      setEditingPersonal(false);
      setPersonalSuccess("Profile updated successfully.");
      await refreshProfile();
      setTimeout(() => setPersonalSuccess(""), 3000);
    } catch (err) {
      setPersonalError("Failed to update profile. Please try again.");
      console.error(err);
    } finally {
      setPersonalLoading(false);
    }
  }

  function handleCancelPersonal() {
    setPersonalDraft({ ...profile });
    setEditingPersonal(false);
    setPersonalError("");
  }

  // Save security — change password (existing password users)
  async function handleSaveSecurity() {
    setSecurityError("");
    setSecuritySuccess("");

    const { currentPassword, newPassword, confirmPassword } = securityData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityError("Please fill in all fields.");
      return;
    }

    const pwError = validatePassword(newPassword);
    if (pwError) { setSecurityError(pwError); return; }

    if (newPassword !== confirmPassword) {
      setSecurityError("New passwords do not match.");
      return;
    }

    setSecurityLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setEditingSecurity(false);
      setSecuritySuccess("Password changed successfully.");
      setTimeout(() => setSecuritySuccess(""), 3000);
    } catch (err) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setSecurityError("Current password is incorrect.");
      } else {
        setSecurityError("Failed to change password. Please try again.");
      }
      console.error(err);
    } finally {
      setSecurityLoading(false);
    }
  }

  // Set password for Google-only users (link email/password provider)
  async function handleSetPassword() {
    setSecurityError("");
    setSecuritySuccess("");

    const { newPassword, confirmPassword } = securityData;

    if (!newPassword || !confirmPassword) {
      setSecurityError("Please fill in all fields.");
      return;
    }

    const pwError = validatePassword(newPassword);
    if (pwError) { setSecurityError(pwError); return; }

    if (newPassword !== confirmPassword) {
      setSecurityError("Passwords do not match.");
      return;
    }

    setSecurityLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, newPassword);
      await linkWithCredential(auth.currentUser, credential);

      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setEditingSecurity(false);
      setSecuritySuccess("Password set! You can now sign in with email/password or Google.");
      setTimeout(() => setSecuritySuccess(""), 5000);
    } catch (err) {
      if (err.code === "auth/provider-already-linked") {
        setSecurityError("A password is already linked to this account.");
      } else {
        setSecurityError("Failed to set password. Please try again.");
      }
      console.error(err);
    } finally {
      setSecurityLoading(false);
    }
  }

  function handleCancelSecurity() {
    setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setEditingSecurity(false);
    setSecurityError("");
  }

  // Password validation helper
  function validatePassword(pw) {
    if (pw.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pw)) return "Password must include at least one uppercase letter.";
    if (!/[a-z]/.test(pw)) return "Password must include at least one lowercase letter.";
    if (!/[0-9]/.test(pw)) return "Password must include at least one number.";
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) return "Password must include at least one special character.";
    return null;
  }

  const initial =
    user?.displayName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        {/* No topbar on settings page */}
        <main className="settings-page">
          <h1 className="settings-title">Settings</h1>

          {/* ===================== Personal Information ===================== */}
          <section className="settings-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              {!editingPersonal ? (
                <button className="btn-edit" onClick={() => setEditingPersonal(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
              ) : (
                <div className="section-actions">
                  <button className="btn-cancel" onClick={handleCancelPersonal} disabled={personalLoading}>Cancel</button>
                  <button className="btn-save" onClick={handleSavePersonal} disabled={personalLoading}>
                    {personalLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>

            <ErrorAlert message={personalError} />
            {personalSuccess && <div className="success-message">{personalSuccess}</div>}

            <div className="settings-form">
              {/* Profile Photo */}
              <div className="profile-photo-section">
                <div className="profile-photo-wrapper" onClick={() => editingPersonal && fileInputRef.current?.click()}>
                  {personalDraft.photoURL ? (
                    <img src={personalDraft.photoURL} alt="Profile" className="profile-photo" />
                  ) : (
                    <div className="profile-photo-placeholder">{initial}</div>
                  )}
                  {editingPersonal && (
                    <div className="profile-photo-overlay">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden-input"
                />
                {editingPersonal && <p className="photo-hint">Click to change photo (max 200KB)</p>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="settings-firstName">First Name</label>
                  <input
                    id="settings-firstName"
                    type="text"
                    value={personalDraft.firstName}
                    onChange={(e) => setPersonalDraft((prev) => ({ ...prev, firstName: e.target.value }))}
                    disabled={!editingPersonal}
                    maxLength={50}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="settings-middleName">Middle Name <span className="optional">(optional)</span></label>
                  <input
                    id="settings-middleName"
                    type="text"
                    value={personalDraft.middleName}
                    onChange={(e) => setPersonalDraft((prev) => ({ ...prev, middleName: e.target.value }))}
                    disabled={!editingPersonal}
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="settings-lastName">Last Name</label>
                <input
                  id="settings-lastName"
                  type="text"
                  value={personalDraft.lastName}
                  onChange={(e) => setPersonalDraft((prev) => ({ ...prev, lastName: e.target.value }))}
                  disabled={!editingPersonal}
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label htmlFor="settings-email">Email</label>
                <input
                  id="settings-email"
                  type="email"
                  value={personalDraft.email}
                  disabled
                  className="input-disabled-always"
                />
                <p className="field-hint">Email is tied to your authentication provider and cannot be changed here for security.</p>
              </div>
            </div>
          </section>

          {/* ===================== Security ===================== */}
          <section className="settings-section">
            <div className="section-header">
              <h2>Security</h2>
              {isGoogleUser && !hasPasswordProvider ? (
                /* Google-only user — show "Set Password" */
                !editingSecurity ? (
                  <button className="btn-edit" onClick={() => setEditingSecurity(true)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Set Password
                  </button>
                ) : (
                  <div className="section-actions">
                    <button className="btn-cancel" onClick={handleCancelSecurity} disabled={securityLoading}>Cancel</button>
                    <button className="btn-save" onClick={handleSetPassword} disabled={securityLoading}>
                      {securityLoading ? "Saving..." : "Save"}
                    </button>
                  </div>
                )
              ) : (
                /* Has password provider — show "Edit" to change password */
                !editingSecurity ? (
                  <button className="btn-edit" onClick={() => setEditingSecurity(true)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                ) : (
                  <div className="section-actions">
                    <button className="btn-cancel" onClick={handleCancelSecurity} disabled={securityLoading}>Cancel</button>
                    <button className="btn-save" onClick={handleSaveSecurity} disabled={securityLoading}>
                      {securityLoading ? "Saving..." : "Save"}
                    </button>
                  </div>
                )
              )}
            </div>

            <ErrorAlert message={securityError} />
            {securitySuccess && <div className="success-message">{securitySuccess}</div>}

            {isGoogleUser && !hasPasswordProvider ? (
              /* Google-only: set password form */
              !editingSecurity ? (
                <p className="google-notice">
                  You signed in with Google. Set a password below to also enable email/password login.
                </p>
              ) : (
                <div className="settings-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="settings-newPassword">New Password</label>
                      <input
                        id="settings-newPassword"
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData((prev) => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Min 8 chars, upper, lower, number, symbol"
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="settings-confirmPassword">Confirm Password</label>
                      <input
                        id="settings-confirmPassword"
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <PasswordChecklist
                    password={securityData.newPassword}
                    confirmPassword={securityData.confirmPassword}
                  />
                </div>
              )
            ) : (
              /* Has password: change password form */
              <div className="settings-form">
                <div className="form-group">
                  <label htmlFor="settings-currentPassword">Current Password</label>
                  <input
                    id="settings-currentPassword"
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    disabled={!editingSecurity}
                    placeholder={editingSecurity ? "Enter current password" : "••••••••"}
                    autoComplete="current-password"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="settings-newPassword">New Password</label>
                    <input
                      id="settings-newPassword"
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      disabled={!editingSecurity}
                      placeholder={editingSecurity ? "Min 8 chars, upper, lower, number, symbol" : "••••••••"}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="settings-confirmPassword">Confirm New Password</label>
                    <input
                      id="settings-confirmPassword"
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      disabled={!editingSecurity}
                      placeholder={editingSecurity ? "Re-enter new password" : "••••••••"}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                {editingSecurity && (
                  <PasswordChecklist
                    password={securityData.newPassword}
                    confirmPassword={securityData.confirmPassword}
                  />
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
