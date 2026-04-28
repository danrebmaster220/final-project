/**
 * RegisterPage — Account creation with name fields, email, and password.
 *
 * Security features:
 * - Name validation (letters, spaces, hyphens, apostrophes only)
 * - Password strength enforcement (min 8 chars, upper, lower, number, symbol)
 * - Confirm password match check
 * - Generic error messages
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorMessages";
import { validateRegisterInputs } from "../utils/validators";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import ErrorAlert from "../components/ErrorAlert";

/* User-plus icon for the auth card */
const UserPlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    const validationError = validateRegisterInputs(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.email.trim(), formData.password, {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
      });
      navigate("/content");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <AuthCard icon={UserPlusIcon} title="Create Account" subtitle="Fill in the details below to register" wide>
        <ErrorAlert message={error} />

        <form onSubmit={handleRegister} noValidate>
          <div className="form-row">
            <FormInput
              id="reg-firstName"
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              maxLength={50}
              required
            />
            <FormInput
              id="reg-middleName"
              label="Middle Name"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="Middle name"
              maxLength={50}
              optional
            />
          </div>

          <FormInput
            id="reg-lastName"
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last name"
            maxLength={50}
            required
          />

          <FormInput
            id="reg-email"
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            maxLength={100}
            required
          />

          <FormInput
            id="reg-password"
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Min 8 chars, upper, lower, number, symbol"
            autoComplete="new-password"
            maxLength={128}
            required
          />

          <FormInput
            id="reg-confirmPassword"
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            maxLength={128}
            required
          />

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner-small"></span>
                Creating account...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </AuthCard>
    </div>
  );
}
