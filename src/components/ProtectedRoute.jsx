/**
 * ProtectedRoute — Guards routes that require authentication AND email verification.
 *
 * - Not logged in → redirect to login
 * - Logged in but email not verified → redirect to /verify-email
 * - Logged in + verified → render children
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If email not verified, redirect to verification page
  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
}
