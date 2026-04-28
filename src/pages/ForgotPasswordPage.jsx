/**
 * ForgotPasswordPage — Send a password reset email via Firebase Auth.
 *
 * - Uses sendPasswordResetEmail (Firebase handles the email + reset link)
 * - 60-second cooldown between resend attempts
 * - Generic success message regardless of whether the email exists (security)
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import ErrorAlert from "../components/ErrorAlert";

/* Key icon */
const KeyIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmed);
      // Always show success — don't reveal if email exists or not (security)
      setSuccess("If an account exists with this email, a password reset link has been sent. Check your inbox and spam folder.");
      setCooldown(60);
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please wait a few minutes and try again.");
      } else {
        // Generic message for security — don't reveal if email exists
        setSuccess("If an account exists with this email, a password reset link has been sent. Check your inbox and spam folder.");
        setCooldown(60);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <AuthCard icon={KeyIcon} title="Reset Password" subtitle="Enter your email to receive a reset link">
        <ErrorAlert message={error} />
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            id="forgot-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            maxLength={100}
            required
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || cooldown > 0}
          >
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner-small"></span>
                Sending...
              </span>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <p className="auth-footer">
          Remember your password? <Link to="/">Sign in</Link>
        </p>
      </AuthCard>
    </div>
  );
}
