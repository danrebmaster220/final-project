/**
 * PasswordChecklist — Real-time password requirement indicators.
 * Shows a checklist that updates as the user types.
 */

export default function PasswordChecklist({ password = "", confirmPassword = null }) {
  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character (!@#$%...)", met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];

  const showMatch = confirmPassword !== null && confirmPassword.length > 0;

  return (
    <div className="password-checklist">
      <ul className="checklist-list">
        {checks.map((check, i) => (
          <li key={i} className={`checklist-item ${check.met ? "checklist-met" : "checklist-unmet"}`}>
            {check.met ? (
              <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
              </svg>
            )}
            {check.label}
          </li>
        ))}
      </ul>

      {showMatch && (
        <div className={`password-match ${password === confirmPassword ? "match-ok" : "match-fail"}`}>
          {password === confirmPassword ? (
            <>
              <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Passwords match
            </>
          ) : (
            <>
              <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Passwords do not match
            </>
          )}
        </div>
      )}
    </div>
  );
}
