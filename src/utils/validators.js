const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginInputs(email, password) {
  if (!email.trim() || !password.trim()) {
    return "Please fill in all fields.";
  }
  if (email.trim().length > 100) {
    return "Email is too long.";
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return "Please enter a valid email address.";
  }
  if (password.length > 128) {
    return "Password is too long.";
  }
  return null;
}

export function validateRegisterInputs({ firstName, middleName, lastName, email, password, confirmPassword }) {
  if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
    return "Please fill in all required fields.";
  }

  // Name validation
  if (!NAME_REGEX.test(firstName.trim())) {
    return "First name can only contain letters, spaces, hyphens, and apostrophes.";
  }
  if (firstName.trim().length > 50) {
    return "First name is too long (max 50 characters).";
  }
  if (middleName.trim() && !NAME_REGEX.test(middleName.trim())) {
    return "Middle name can only contain letters, spaces, hyphens, and apostrophes.";
  }
  if (middleName.trim().length > 50) {
    return "Middle name is too long (max 50 characters).";
  }
  if (!NAME_REGEX.test(lastName.trim())) {
    return "Last name can only contain letters, spaces, hyphens, and apostrophes.";
  }
  if (lastName.trim().length > 50) {
    return "Last name is too long (max 50 characters).";
  }

  // Email
  if (!EMAIL_REGEX.test(email.trim())) {
    return "Please enter a valid email address.";
  }
  if (email.trim().length > 100) {
    return "Email is too long.";
  }

  // Password strength
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (password.length > 128) {
    return "Password is too long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number.";
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Password must include at least one special character.";
  }

  // Confirm password
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}
