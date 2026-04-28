/**
 * RegisterPage — Multi-step account creation.
 *
 * Step 1: Personal info (First Name, Middle Name optional, Last Name)
 * Step 2: Credentials (Email, Password with live checklist, Confirm Password with match)
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorMessages";
import { validateRegisterInputs } from "../utils/validators";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import ErrorAlert from "../components/ErrorAlert";
import PasswordChecklist from "../components/PasswordChecklist";

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
  const [step, setStep] = useState(1);
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

  // Step 1 validation
  function handleNextStep() {
    setError("");
    const NAME_REGEX = /^[a-zA-Z\s'-]+$/;

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }
    if (!NAME_REGEX.test(formData.firstName.trim())) {
      setError("First name can only contain letters, spaces, hyphens, and apostrophes.");
      return;
    }
    if (formData.firstName.trim().length > 50) {
      setError("First name is too long (max 50 characters).");
      return;
    }
    if (formData.middleName.trim() && !NAME_REGEX.test(formData.middleName.trim())) {
      setError("Middle name can only contain letters, spaces, hyphens, and apostrophes.");
      return;
    }
    if (!NAME_REGEX.test(formData.lastName.trim())) {
      setError("Last name can only contain letters, spaces, hyphens, and apostrophes.");
      return;
    }

    setStep(2);
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

  const stepTitle = step === 1 ? "Personal Information" : "Account Credentials";
  const stepSubtitle = step === 1
    ? "Step 1 of 2 — Tell us about yourself"
    : "Step 2 of 2 — Set up your login credentials";

  return (
    <div className="auth-page">
      <AuthCard icon={UserPlusIcon} title="Create Account" subtitle={stepSubtitle} wide>
        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? "step-active" : ""}`}>1</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 2 ? "step-active" : ""}`}>2</div>
        </div>

        <ErrorAlert message={error} />

        <form onSubmit={step === 2 ? handleRegister : (e) => { e.preventDefault(); handleNextStep(); }} noValidate>
          {step === 1 && (
            <>
              <h3 className="step-section-title">{stepTitle}</h3>
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

              <button type="submit" className="btn btn-primary">
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="step-section-title">{stepTitle}</h3>

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
                placeholder="Create a password"
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

              <PasswordChecklist
                password={formData.password}
                confirmPassword={formData.confirmPassword}
              />

              <div className="step-buttons">
                <button type="button" className="btn btn-secondary" onClick={() => { setStep(1); setError(""); }}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <span className="btn-loading">
                      <span className="spinner-small"></span>
                      Creating...
                    </span>
                  ) : (
                    "Register"
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </AuthCard>
    </div>
  );
}
