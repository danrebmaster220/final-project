/**
 * Maps Firebase Auth error codes to user-friendly, secure messages.
 * Never reveals whether the email exists or specific internal details.
 */

const ERROR_MAP = {
  // Login errors
  "auth/user-not-found": "Invalid email or password.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many failed attempts. Please try again later.",
  "auth/user-disabled": "This account has been disabled.",

  // Registration errors
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password is too weak. Use at least 8 characters.",

  // OAuth errors
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/popup-blocked": "Pop-up was blocked. Please allow pop-ups and try again.",
  "auth/cancelled-popup-request": "Sign-in cancelled.",
};

export function getErrorMessage(errorCode) {
  return ERROR_MAP[errorCode] || "An error occurred. Please try again.";
}
