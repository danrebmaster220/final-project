

import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function ContentPage() {
  const { user, firestoreProfile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [lessonCompleted, setLessonCompleted] = useState(false);

useEffect(() => {
    function checkCompletion() {
      setLessonCompleted(localStorage.getItem("lesson_cia_triad_completed") === "true");
    }
    checkCompletion();
    window.addEventListener("focus", checkCompletion);
    return () => window.removeEventListener("focus", checkCompletion);
  }, []);

  const initial =
    user?.displayName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const profilePhoto = firestoreProfile?.photoURL || user?.photoURL || null;
  const displayName = user?.displayName?.split(" ")[0] || "User";

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        {}
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

        {}
        <main className="content-main dashboard-main">

          {}
          <section className="dashboard-hero">
            {}
            <div className="hero-glow hero-glow--blue" />
            <div className="hero-glow hero-glow--purple" />

            {}
            <span className="hero-particle hero-particle--1" />
            <span className="hero-particle hero-particle--2" />
            <span className="hero-particle hero-particle--3" />

            <div className="hero-content">
              <p className="hero-eyebrow">
                <span className="hero-dot" />
                Learning Dashboard
              </p>
              <h1 className="hero-title">
                Welcome Back,{" "}
                <span className="hero-title--gradient">{displayName}</span>
              </h1>
              <p className="hero-subtitle">
                Continue your cybersecurity learning journey
              </p>

              {}
              <div className="hero-search-wrapper">
                <div className="hero-search">
                  <svg
                    className="hero-search-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    id="dashboard-search"
                    className="hero-search-input"
                    type="text"
                    placeholder="What will you learn today?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </section>

          {}
          <section className="dashboard-lessons">
            <div className="lessons-header">
              <h2 className="lessons-label">Lessons</h2>
              <span className="lessons-badge">1 Available</span>
            </div>

            <div className="lessons-grid">
              {}
              <article className="lesson-card">
                {}
                <div className="lesson-card-glow" />

                {}
                <div className="lesson-card-illustration">
                  {}
                  <div className="shield-wrapper">
                    <div className="shield-ring shield-ring--outer" />
                    <div className="shield-ring shield-ring--inner" />
                    <svg
                      className="shield-icon"
                      viewBox="0 0 80 90"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {}
                      <path
                        d="M40 4L8 18V42C8 60.5 22 76.5 40 82C58 76.5 72 60.5 72 42V18L40 4Z"
                        fill="url(#shieldGrad)"
                        stroke="url(#shieldStroke)"
                        strokeWidth="1.5"
                      />
                      {}
                      <rect
                        x="28"
                        y="40"
                        width="24"
                        height="18"
                        rx="3"
                        fill="url(#lockGrad)"
                        opacity="0.9"
                      />
                      {}
                      <path
                        d="M33 40V34C33 30.7 36.1 28 40 28C43.9 28 47 30.7 47 34V40"
                        stroke="url(#shackleGrad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      {}
                      <circle cx="40" cy="49" r="3" fill="#0f172a" opacity="0.7" />
                      <rect x="38.5" y="49" width="3" height="5" rx="1" fill="#0f172a" opacity="0.7" />

                      {}
                      <line x1="16" y1="30" x2="24" y2="30" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
                      <line x1="56" y1="30" x2="64" y2="30" stroke="#a78bfa" strokeWidth="1" opacity="0.5" />
                      <line x1="16" y1="55" x2="22" y2="55" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
                      <circle cx="16" cy="30" r="2" fill="#38bdf8" opacity="0.6" />
                      <circle cx="64" cy="30" r="2" fill="#a78bfa" opacity="0.6" />

                      <defs>
                        <linearGradient id="shieldGrad" x1="40" y1="4" x2="40" y2="82" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
                        </linearGradient>
                        <linearGradient id="shieldStroke" x1="8" y1="4" x2="72" y2="82" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="50%" stopColor="#818cf8" />
                          <stop offset="100%" stopColor="#a78bfa" />
                        </linearGradient>
                        <linearGradient id="lockGrad" x1="28" y1="40" x2="52" y2="58" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="shackleGrad" x1="33" y1="28" x2="47" y2="40" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#7dd3fc" />
                          <stop offset="100%" stopColor="#c4b5fd" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {}
                    <span className="shield-dot shield-dot--tl" />
                    <span className="shield-dot shield-dot--br" />
                  </div>
                </div>

                {}
                <div className="lesson-card-body">
                  {}
                  <div className="lesson-card-top">
                    <span className="lesson-topic-tag">Cybersecurity</span>
                    {lessonCompleted ? (
                      <span className="lesson-status lesson-status--completed">
                        <span className="lesson-status-dot" />
                        Completed
                      </span>
                    ) : (
                      <span className="lesson-status lesson-status--not-started">
                        <span className="lesson-status-dot" />
                        Not Started
                      </span>
                    )}
                  </div>

                  {}
                  <h3 className="lesson-card-title">CIA Triad</h3>

                  {}
                  <p className="lesson-card-desc">
                    Learn the fundamentals of{" "}
                    <strong>Confidentiality</strong>,{" "}
                    <strong>Integrity</strong>, and{" "}
                    <strong>Availability</strong> — the core principles that
                    underpin modern information security.
                  </p>

                  {}
                  <div className="lesson-meta">
                    <div className="lesson-meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>10–15 min</span>
                    </div>
                    <div className="lesson-meta-divider" />
                    <div className="lesson-meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span>Beginner</span>
                    </div>
                  </div>

                  {}
                  <div className="lesson-progress-wrapper">
                    <div className="lesson-progress-bar">
                      <div
                        className="lesson-progress-fill"
                        style={{ width: lessonCompleted ? "100%" : "0%" }}
                      />
                    </div>
                    <span className="lesson-progress-label">
                      {lessonCompleted ? "100% Complete" : "0% Complete"}
                    </span>
                  </div>

                  {}
                  <button
                    id="start-lesson-cia-triad"
                    className="btn-start-lesson"
                    onClick={() => navigate("/lesson/cia-triad")}
                  >
                    <span>{lessonCompleted ? "Review Lesson" : "Start Lesson"}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </article>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
