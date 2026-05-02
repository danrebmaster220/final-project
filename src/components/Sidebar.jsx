import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import spavionLogo from "../assets/spavion_logo.jpg";

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout, firestoreProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initial =
    user?.displayName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const displayName = user?.displayName || user?.email || "User";
  const profilePhoto = firestoreProfile?.photoURL || user?.photoURL || null;

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  function handleNav(path) {
    navigate(path);
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile hamburger menu button */}
      <button
        className={`mobile-menu-btn${mobileOpen ? " mobile-menu-btn--open" : ""}`}
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`sidebar${expanded ? " sidebar--expanded" : ""}${mobileOpen ? " sidebar--mobile-open" : ""}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Logo */}
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <img src={spavionLogo} alt="Spavion" className="sidebar-brand-logo" />
            <span className="sidebar-label">Spavion</span>
          </div>
        </div>

        {/* Divider */}
        <div className="sidebar-divider"></div>

        {/* Sidebar navigation */}
        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item${location.pathname === "/content" ? " sidebar-nav-item--active" : ""}`}
            onClick={() => handleNav("/content")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="sidebar-label">Home</span>
          </button>

          <button
            className={`sidebar-nav-item${location.pathname === "/settings" ? " sidebar-nav-item--active" : ""}`}
            onClick={() => handleNav("/settings")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span className="sidebar-label">Settings</span>
          </button>
        </nav>

        <div className="sidebar-spacer"></div>

        {/* Divider */}
        <div className="sidebar-divider"></div>

        {/* Profile section */}
        <div className="sidebar-profile">
          {profilePhoto ? (
            <img src={profilePhoto} alt="" className="sidebar-avatar-img" />
          ) : (
            <div className="sidebar-avatar">{initial}</div>
          )}
          <span className="sidebar-label">{displayName}</span>
        </div>

        {/* Logout button */}
        <button className="sidebar-logout" onClick={() => setShowLogoutModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="sidebar-label">Logout</span>
        </button>
      </aside>

      {/* Logout Confirma modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h2 className="modal-title">Confirm Logout</h2>
            <p className="modal-text">Are you sure you want to sign out?</p>
            <div className="modal-actions">
              <button className="btn-modal btn-modal--cancel" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="btn-modal btn-modal--confirm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
