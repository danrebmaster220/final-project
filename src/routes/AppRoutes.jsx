import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ContentPage from "../pages/ContentPage";
import SettingsPage from "../pages/SettingsPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import LessonPage from "../pages/LessonPage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  const { user } = useAuth();

  const getAuthRedirect = () => {
    if (!user) return null;
    if (!user.emailVerified) return "/verify-email";
    return "/content";
  };

  const authRedirect = getAuthRedirect();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={user ? <Navigate to={authRedirect} replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to={authRedirect} replace /> : <RegisterPage />}
      />
      <Route
        path="/forgot-password"
        element={user ? <Navigate to={authRedirect} replace /> : <ForgotPasswordPage />}
      />

      {/* Email verification page */}
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

      {/* Protected routes */}
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
      <Route
        path="/lesson/cia-triad"
        element={
          <ProtectedRoute>
            <LessonPage />
          </ProtectedRoute>
        }
      />

      {/* Not found */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
