/**
 * AppRoutes — Centralized route definitions.
 *
 * Flow for email/password users:
 *   Register → /verify-email (wait for verification) → /content
 *   Login (unverified) → /verify-email → /content
 *   Login (verified) → /content
 *
 * Google OAuth users skip verification (always emailVerified=true).
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ContentPage from "../pages/ContentPage";
import SettingsPage from "../pages/SettingsPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  const { user } = useAuth();

  // Determine where logged-in users should go
  const getAuthRedirect = () => {
    if (!user) return null;
    if (!user.emailVerified) return "/verify-email";
    return "/content";
  };

  const authRedirect = getAuthRedirect();

  return (
    <Routes>
      {/* Public routes — redirect to appropriate page if already logged in */}
      <Route
        path="/"
        element={user ? <Navigate to={authRedirect} replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to={authRedirect} replace /> : <RegisterPage />}
      />

      {/* Email verification page — only for logged-in but unverified users */}
      <Route
        path="/verify-email"
        element={
          !user ? (
            <Navigate to="/" replace />
          ) : user.emailVerified ? (
            <Navigate to="/content" replace />
          ) : (
            <VerifyEmailPage />
          )
        }
      />

      {/* Protected routes — require login AND email verification */}
      <Route
        path="/content"
        element={
          <ProtectedRoute>
            <ContentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
