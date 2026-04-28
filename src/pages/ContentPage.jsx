import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ContentPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return (
    <div className="content-page">
      <header className="content-header">
        <div className="content-user">
          <div className="user-avatar">
            {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span className="user-name">{user?.displayName || user?.email}</span>
        </div>
        <button className="btn btn-logout" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </header>
      <main className="content-main">
        <h1>Content</h1>
      </main>
    </div>
  );
}
