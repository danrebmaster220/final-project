/**
 * VerifyEmailPage — Shown to users who registered with email/password
 * but haven't verified their email yet.
 *
 * Features:
 * - Auto-detection: polls every 3 seconds, auto-redirects when verified
 * - Resend button with 60-second cooldown
 * - Logout option to return to login page
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmailPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");
  const intervalRef = useRef(null);

  // Poll every 3 seconds to check if email has been verified
  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(intervalRef.current);
          navigate("/content", { replace: true });
        }
      }
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, [navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleResend() {
    setResendError("");
    setResendSuccess("");

    if (resendCooldown > 0) return;

    try {
      await sendEmailVerification(auth.currentUser);
      setResendSuccess("Verification email sent! Check your inbox.");
      setResendCooldown(60);
      setTimeout(() => setResendSuccess(""), 5000);
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        setResendError("Too many requests. Please wait a few minutes and try again.");
      } else {
        setResendError("Failed to send verification email. Please try again.");
      }
      console.error(err);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="auth-page">
      <div className="verify-card">
        {/* Animated envelope icon */}
        <div className="verify-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h1 className="verify-title">Verify Your Email</h1>

        <p className="verify-text">
          We've sent a verification link to:
        </p>

        <p className="verify-email">{user?.email}</p>

        <p className="verify-text">
          Click the link in your inbox to verify your account.
          <br />
          <span className="verify-subtext">This page will automatically redirect once verified.</span>
        </p>

        {/* Polling indicator */}
        <div className="verify-polling">
          <div className="polling-dot"></div>
          <span>Waiting for verification...</span>
        </div>

        {/* Success / Error messages */}
        {resendSuccess && <div className="success-message">{resendSuccess}</div>}
        {resendError && (
          <div className="error-message" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {resendError}
          </div>
        )}

        {/* Action buttons */}
        <div className="verify-actions">
          <button
            className="btn btn-primary"
            onClick={handleResend}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend Verification Email"}
          </button>

          <button className="btn btn-secondary" onClick={handleLogout}>
            Back to Login
          </button>
        </div>

        <p className="verify-hint">
          Didn't receive the email? Check your spam folder or try a different email address.
        </p>
      </div>
    </div>
  );
}
