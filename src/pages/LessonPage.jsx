import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const STEPS = [
  {
    id: 1,
    title: "The CIA Triad",
    icon: "triad",
    body: [
      {
        type: "paragraph",
        text: "The CIA Triad (Confidentiality, Integrity, Availability) is a model for information security. The three elements of the triad are considered the most crucial information security components and should be guaranteed in any secure system.",
      },
      {
        type: "paragraph",
        text: "Serious consequences can result if even one of these elements is breached.",
      },
      {
        type: "paragraph",
        text: "The CIA Triad was created to provide a baseline standard for evaluating and implementing security regardless of the underlying system and/or organization.",
      },
    ],
  },
  {
    id: 2,
    title: "Confidentiality",
    icon: "lock",
    body: [
      {
        type: "paragraph",
        text: 'Confidentiality is "the property that information is not made available or disclosed to unauthorized individuals, entities, or processes." Unauthorized users should not be able to access sensitive resources. Confidentiality must be balanced with availability — authorized persons must still be able to access resources they have permission for.',
      },
      {
        type: "paragraph",
        text: "Although confidentiality is similar to \"privacy\", these two words are not interchangeable. Rather, confidentiality is a component of privacy implemented to protect resources from unauthorized entities.",
      },
      {
        type: "list",
        label: "Examples that compromise confidentiality:",
        variant: "danger",
        items: [
          "A hacker gets access to the password database of a company",
          "A sensitive email is sent to the incorrect individual",
          "A hacker reads sensitive information by intercepting and eavesdropping on a data transfer",
        ],
      },
      {
        type: "list",
        label: "Examples of methods ensuring confidentiality:",
        variant: "success",
        items: [
          "Data encryption",
          "Properly implemented authentication and access control",
          "Securely stored passwords",
          "Multi-factor authentication (MFA)",
          "Biometric verification",
          "Physical security controls such as properly secured server rooms",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Integrity",
    icon: "check",
    body: [
      {
        type: "paragraph",
        text: 'Integrity is "the property of accuracy and completeness." Data must not be changed during transit and unauthorized entities should not be able to alter data. Integrity means maintaining the consistency, accuracy, and trustworthiness of data over its entire life cycle.',
      },
      {
        type: "list",
        label: "Examples that compromise integrity:",
        variant: "danger",
        items: [
          "Human error when entering data",
          "Errors during data transmission",
          "Software bugs and hardware failures",
          "Hackers change information they should not have access to",
        ],
      },
      {
        type: "list",
        label: "Examples of methods ensuring integrity:",
        variant: "success",
        items: [
          "Well-functioning authentication methods and access control",
          "Checking integrity with hash functions",
          "Backups and redundancy",
          "Auditing and logging",
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Availability",
    icon: "signal",
    body: [
      {
        type: "paragraph",
        text: 'Availability is "the property of being accessible and usable on demand by an authorized entity." Authorized persons should have access to permitted resources at all times.',
      },
      {
        type: "list",
        label: "Examples that compromise availability:",
        variant: "danger",
        items: [
          "Denial-of-service attacks (DoS)",
          "Hardware failures",
          "Fire or other natural disasters",
          "Software or network misconfigurations",
        ],
      },
      {
        type: "list",
        label: "Examples of methods ensuring availability:",
        variant: "success",
        items: [
          "Intrusion detection systems (IDSs)",
          "Network traffic control",
          "Firewalls",
          "Physical security of hardware and underlying infrastructure",
          "Protections against fire, water, and other elements",
          "Hardware maintenance and redundancy",
        ],
      },
    ],
  },
];

const QUIZ_QUESTIONS = [
  {
    id: "q1",
    text: "How could an intruder harm the security goal of confidentiality?",
    options: [
      "By deleting all the databases.",
      "By stealing a database where general configuration information for the system is stored.",
      "By stealing a database where names and emails are stored and uploading it to a website.",
      "Confidentiality can't be harmed by an intruder.",
    ],
    correct: 2,
  },
  {
    id: "q2",
    text: "How could an intruder harm the security goal of integrity?",
    options: [
      "By changing the names and emails of one or more users stored in a database.",
      "By listening to incoming and outgoing network traffic.",
      "By bypassing the access control mechanisms used to manage database access.",
      "Integrity can only be harmed when the intruder has physical access to the database.",
    ],
    correct: 0,
  },
  {
    id: "q3",
    text: "How could an intruder harm the security goal of availability?",
    options: [
      "By exploiting a software bug that allows the attacker to bypass the normal authentication mechanisms for a database.",
      "By redirecting sensitive emails to other individuals.",
      "Availability can only be harmed by unplugging the power supply of the storage devices.",
      "By launching a denial of service attack on the servers.",
    ],
    correct: 3,
  },
  {
    id: "q4",
    text: "What happens if at least one of the CIA security goals is harmed?",
    options: [
      "All three goals must be harmed for the system's security to be compromised; harming just one goal has no effect.",
      "The system's security is compromised even if only one goal is harmed.",
      "It is acceptable if an attacker reads or changes data since at least some data is still available.",
      "Reading sensitive data is not tolerable, but changing data is acceptable.",
    ],
    correct: 1,
  },
];

const TOTAL_STEPS = STEPS.length + 1;

function StepIcon({ type }) {
  const cls = "step-icon-svg";
  if (type === "triad")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 22 20 2 20" />
        <line x1="12" y1="8" x2="12" y2="14" />
        <circle cx="12" cy="17" r="0.5" fill="currentColor" />
      </svg>
    );
  if (type === "lock")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  if (type === "check")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    );
  if (type === "signal")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="6" x2="1" y2="18" />
        <line x1="6" y1="3" x2="6" y2="21" />
        <line x1="11" y1="8" x2="11" y2="16" />
        <line x1="16" y1="5" x2="16" y2="19" />
        <line x1="21" y1="10" x2="21" y2="14" />
      </svg>
    );
  return null;
}

export default function LessonPage() {
  const navigate = useNavigate();
  const { user, firestoreProfile, refreshProfile } = useAuth();

const [currentStep, setCurrentStep] = useState(1);

const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [quizError, setQuizError] = useState("");

const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!user) {
      setCompleted(false);
      return;
    }
    if (firestoreProfile?.lessonProgress?.ciaTriadCompleted) {
      setCompleted(true);
      return;
    }
    const key = `lesson_cia_triad_completed_${user.uid}`;
    setCompleted(localStorage.getItem(key) === "true");
  }, [user, firestoreProfile]);

  const isQuizStep = currentStep === TOTAL_STEPS;
  const progressPct = Math.round((currentStep / TOTAL_STEPS) * 100);
  const step = STEPS[currentStep - 1];

function goNext() {
    if (currentStep < TOTAL_STEPS) setCurrentStep((s) => s + 1);
  }

  function goPrev() {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  }

  function handleAnswer(qId, optIdx) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setQuizError("");
  }

  async function handleSubmit() {
    const unanswered = QUIZ_QUESTIONS.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      setQuizError(`Please answer all ${QUIZ_QUESTIONS.length} questions before submitting.`);
      return;
    }
    const score = QUIZ_QUESTIONS.filter((q) => answers[q.id] === q.correct).length;
    const passed = score / QUIZ_QUESTIONS.length >= 0.6;
    setSubmitted(true);
    if (passed) {
      if (!user) return;
      const key = `lesson_cia_triad_completed_${user.uid}`;
      localStorage.setItem(key, "true");
      setCompleted(true);
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            lessonProgress: {
              ciaTriadCompleted: true,
              ciaTriadCompletedAt: serverTimestamp(),
            },
          },
          { merge: true }
        );
        if (refreshProfile) {
          await refreshProfile();
        }
      } catch (err) {
        console.error("Failed to save lesson progress:", err);
      }
    }
  }

  function handleRetake() {
    setAnswers({});
    setSubmitted(false);
    setQuizError("");

  }

  function handleBackToDashboard() {
    navigate("/content");
  }

if (submitted) {
    const score = QUIZ_QUESTIONS.filter((q) => answers[q.id] === q.correct).length;
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    const passed = pct >= 60;
    const passingScore = Math.ceil(QUIZ_QUESTIONS.length * 0.6);

if (passed) {
      return (
        <div className="app-layout">
          <Sidebar />
          <div className="app-content">
            <main className="content-main lesson-main">
              <div className="celebration-wrap">
                <div className="cel-glow cel-glow--blue" />
                <div className="cel-glow cel-glow--purple" />

                <div className="celebration-card">
                  <div className="cel-emoji">🎉</div>
                  <h1 className="cel-title">Lesson Completed!</h1>
                  <p className="cel-subtitle">
                    You've successfully finished the <strong>CIA Triad</strong> lesson.
                  </p>

                  <div className="cel-score">
                    <span className="cel-score-num">{score}</span>
                    <span className="cel-score-denom">/ {QUIZ_QUESTIONS.length}</span>
                    <span className="cel-score-label">correct answers</span>
                  </div>

                  <div className="cel-progress-bar">
                    <div
                      className="cel-progress-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="cel-message">
                    {score === QUIZ_QUESTIONS.length
                      ? "Perfect score! You've mastered the CIA Triad. 🏆"
                      : "Great work! You have a solid understanding of the CIA Triad."}
                  </p>

                  <div className="cel-actions">
                    <button className="btn-cel-primary" onClick={handleBackToDashboard}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      );
    }

return (
      <div className="app-layout">
        <Sidebar />
        <div className="app-content">
          <main className="content-main lesson-main">
            <div className="celebration-wrap">
              {}
              <div className="cel-glow cel-glow--red" />
              <div className="cel-glow cel-glow--purple" />

              <div className="celebration-card fail-card">
                {}
                <div className="fail-card-glow" />

                <div className="cel-emoji">😔</div>
                <h1 className="cel-title fail-title">Quiz Failed</h1>
                <p className="cel-subtitle">
                  You scored <strong>{score} out of {QUIZ_QUESTIONS.length}</strong> ({pct}%).
                  You need at least <strong>{passingScore}/{QUIZ_QUESTIONS.length} (60%)</strong> to pass.
                </p>

                {}
                <div className="cel-score">
                  <span className="cel-score-num fail-score-num">{score}</span>
                  <span className="cel-score-denom">/ {QUIZ_QUESTIONS.length}</span>
                  <span className="cel-score-label">correct answers</span>
                </div>

                {}
                <div className="cel-progress-bar">
                  <div
                    className="cel-progress-fill fail-progress-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {}
                <div className="fail-threshold">
                  <div className="fail-threshold-bar">
                    <div className="fail-threshold-marker" style={{ left: "60%" }} />
                  </div>
                  <p className="fail-threshold-label">Passing threshold: 60%</p>
                </div>

                <p className="cel-message">
                  Don't give up! Review the lesson content and try the quiz again. You've got this! 💪
                </p>

                <div className="cel-actions fail-actions">
                  <button className="btn-cel-primary" onClick={handleBackToDashboard}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Back to Dashboard
                  </button>
                  <button
                    id="retake-quiz-btn"
                    className="btn-retake"
                    onClick={handleRetake}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
                    </svg>
                    Retake Quiz
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <main className="content-main lesson-main">

          {}
          <div className="lesson-topbar">
            <div className="lesson-topbar-inner">
              <div className="lesson-topbar-meta">
                <span className="lesson-topbar-title">Lesson: CIA Triad</span>
                <span className="lesson-topbar-step">
                  Step {currentStep} of {TOTAL_STEPS}
                </span>
              </div>
              <div className="lesson-progress-track">
                <div
                  className="lesson-progress-bar-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {}
          <div className="lesson-breadcrumbs">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`lesson-crumb ${
                  i + 1 < currentStep
                    ? "lesson-crumb--done"
                    : i + 1 === currentStep
                    ? "lesson-crumb--active"
                    : ""
                }`}
                title={i + 1 <= STEPS.length ? STEPS[i].title : "Quiz"}
              >
                {i + 1 < currentStep ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
            ))}
          </div>

          {}
          <div className="lesson-content-wrap">

            {}
            {!isQuizStep && step && (
              <article className="lesson-content-card" key={currentStep}>
                {}
                <div className="lesson-card-glow" />

                {}
                <div className="lesson-step-header">
                  <div className="lesson-step-icon-wrap">
                    <StepIcon type={step.icon} />
                  </div>
                  <div>
                    <p className="lesson-step-eyebrow">Step {currentStep} of {TOTAL_STEPS - 1}</p>
                    <h2 className="lesson-step-title">{step.title}</h2>
                  </div>
                </div>

                <div className="lesson-step-divider" />

                {}
                <div className="lesson-step-body">
                  {step.body.map((block, bi) => {
                    if (block.type === "paragraph")
                      return (
                        <p key={bi} className="lesson-step-paragraph">
                          {block.text}
                        </p>
                      );
                    if (block.type === "list")
                      return (
                        <div key={bi} className={`lesson-step-list-block lesson-step-list-block--${block.variant}`}>
                          <p className="lesson-step-list-label">{block.label}</p>
                          <ul className="lesson-step-list">
                            {block.items.map((item, ii) => (
                              <li key={ii} className="lesson-step-list-item">
                                <span className="lesson-step-list-bullet" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    return null;
                  })}
                </div>
              </article>
            )}

            {}
            {isQuizStep && (
              <article className="lesson-content-card quiz-card" key="quiz">
                <div className="lesson-card-glow" />

                {}
                <div className="quiz-header">
                  <div className="quiz-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <p className="lesson-step-eyebrow">Final Step</p>
                    <h2 className="lesson-step-title">Final Quiz</h2>
                  </div>
                </div>

                <div className="lesson-step-divider" />

                {}
                <p className="quiz-preamble">
                  Now it's time for a quiz! Answer the following questions to check if you understood the topic.
                </p>
                <p className="quiz-scenario">
                  <strong>Scenario:</strong> Today, most systems are protected by a firewall. A properly configured firewall can prevent malicious entities from accessing a system. For this quiz, imagine a system that handles personal data but is <em>not</em> protected by a firewall:
                </p>

                {}
                <div className="quiz-questions">
                  {QUIZ_QUESTIONS.map((q, qi) => (
                    <div key={q.id} className="quiz-question">
                      <p className="quiz-question-text">
                        <span className="quiz-question-num">{qi + 1}.</span>{" "}
                        {q.text}
                      </p>
                      <div className="quiz-options">
                        {q.options.map((opt, oi) => {
                          const selected = answers[q.id] === oi;
                          return (
                            <button
                              key={oi}
                              id={`${q.id}-opt-${oi}`}
                              className={`quiz-option ${selected ? "quiz-option--selected" : ""}`}
                              onClick={() => handleAnswer(q.id, oi)}
                            >
                              <span className="quiz-option-letter">
                                {["A", "B", "C", "D"][oi]}
                              </span>
                              <span className="quiz-option-text">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {}
                {quizError && (
                  <div className="quiz-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {quizError}
                  </div>
                )}

                {}
                <button
                  id="submit-quiz-btn"
                  className="btn-submit-quiz"
                  onClick={handleSubmit}
                >
                  <span>Submit Quiz</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              </article>
            )}
          </div>

          {}
          <div className="lesson-nav">
            <button
              id="lesson-prev-btn"
              className="btn-lesson-prev"
              onClick={goPrev}
              disabled={currentStep === 1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Previous
            </button>

            {!isQuizStep && (
              <button
                id="lesson-next-btn"
                className="btn-lesson-next"
                onClick={goNext}
              >
                {currentStep === TOTAL_STEPS - 1 ? "Take Quiz" : "Next"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
