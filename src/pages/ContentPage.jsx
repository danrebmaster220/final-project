/**
 * ContentPage — Protected content page with sidebar layout.
 */

import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function ContentPage() {
  const { user, firestoreProfile } = useAuth();
  const navigate = useNavigate();

  const initial =
    user?.displayName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const profilePhoto = firestoreProfile?.photoURL || user?.photoURL || null;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        {/* Floating profile icon — top right, no header bar */}
        <div
          className="floating-profile"
          onClick={() => navigate("/settings")}
          title="Go to Settings"
        >
          {profilePhoto ? (
            <img src={profilePhoto} alt="" className="topbar-avatar-img" />
          ) : (
            <div className="topbar-avatar">{initial}</div>
          )}
        </div>

        {/* Main content area */}
        <main className="content-main">
          <h1>Content</h1>
        </main>
      </div>
    </div>
  );
}
