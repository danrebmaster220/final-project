/**
 * AppRoutes — Centralized route definitions.
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ContentPage from "../pages/ContentPage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes — redirect to /content if already logged in */}
      <Route
        path="/"
        element={user ? <Navigate to="/content" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/content" replace /> : <RegisterPage />}
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

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
