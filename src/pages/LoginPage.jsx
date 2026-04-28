/**
 * LoginPage — Email/password login with Google OAuth option.
 *
 * Security features:
 * - Input validation (email format, empty checks, length limits)
 * - Generic error messages (never reveals which field is wrong)
 * - 3-second lockout after failed attempt (brute-force mitigation)
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorMessages";
import { validateLoginInputs } from "../utils/validators";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import GoogleButton from "../components/GoogleButton";
import ErrorAlert from "../components/ErrorAlert";

/* Lock icon for the auth card */
const LockIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lockout, setLockout] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const validationError = validateLoginInputs(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (lockout) {
      setError("Please wait before trying again.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email.trim(), password);
      const loggedInUser = result.user;

      // Check if email is verified
      if (!loggedInUser.emailVerified) {
        // Re-send verification email in case the old one expired
        try { await sendEmailVerification(loggedInUser); } catch (_) {}
        navigate("/verify-email");
      } else {
        navigate("/content");
      }
    } catch (err) {
      setError(getErrorMessage(err.code));
      setLockout(true);
      setTimeout(() => setLockout(false), 3000);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate("/content"); // Google users are always verified
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <AuthCard icon={LockIcon} title="Welcome Back" subtitle="Sign in to your account">
        <ErrorAlert message={error} />

        <form onSubmit={handleLogin} noValidate>
          <FormInput
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            maxLength={100}
            required
          />
          <FormInput
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            maxLength={128}
            required
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || lockout}
          >
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner-small"></span>
                Signing in...
              </span>
            ) : lockout ? (
              "Please wait..."
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="divider"><span>or</span></div>

        <GoogleButton onClick={handleGoogleLogin} disabled={isLoading} />

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </AuthCard>
    </div>
  );
}
