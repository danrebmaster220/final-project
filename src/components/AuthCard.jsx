export default function AuthCard({ icon, title, subtitle, wide = false, children }) {
  return (
    <div className={`auth-card${wide ? " auth-card--wide" : ""}`}>
      <div className="auth-header">
        <div className="auth-icon">{icon}</div>
        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
