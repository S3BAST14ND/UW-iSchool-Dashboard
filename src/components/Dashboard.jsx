import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../index.css";

import {
  getCurrentUser,
  getCurrentUserCourses,
  getLatestQuizAttempt,
  getRoadmapProgress,
  saveRoadmapProgress,
} from "../utils/localStore";

import { courseSkillMap } from "../data/courseSkillMap";
import { inferSkills } from "../utils/inferSkills";
import { careers } from "../data/careers";
import { evaluateCareer } from "../utils/careerEngine";

const quickLinks = [
  {
    label: "Profile",
    href: "/profile",
    emoji: "👤",
    desc: "View quiz, audit, and skill details",
  },
  {
    label: "Change Career",
    href: "/quiz",
    emoji: "✏️",
    desc: "Choose a new career goal",
  },
  {
    label: "Update Audit",
    href: "/parse?mode=reupload",
    emoji: "📄",
    desc: "Refresh your course data",
  },
  {
    label: "Advising",
    href: "/advising",
    emoji: "📅",
    desc: "Book an advising session",
  },
  {
    label: "Resources",
    href: "/resources",
    emoji: "📚",
    desc: "Browse career toolkit",
  },
];

const resourceSuggestions = {
  sql: [
    "Practice SQL joins, grouping, and filtering with small datasets.",
    "Build a mini database project using real-world data.",
  ],
  databases: [
    "Review database design, ER diagrams, and normalization.",
    "Practice turning messy information into structured tables.",
  ],
  dataAnalysis: [
    "Complete a small data analysis project from question to conclusion.",
    "Practice explaining findings in plain language.",
  ],
  statistics: [
    "Review hypothesis testing, distributions, and basic modeling.",
    "Practice interpreting results, not just calculating them.",
  ],
  dataVisualization: [
    "Create dashboards that explain a clear story.",
    "Practice choosing charts based on the question being answered.",
  ],
  programming: [
    "Build a small web app or automation project.",
    "Practice debugging and explaining your technical decisions.",
  ],
  systemsThinking: [
    "Map how data, users, interfaces, and backend systems connect.",
    "Practice explaining tradeoffs between different technical designs.",
  ],
  cybersecurity: [
    "Review authentication, access control, and common security risks.",
    "Practice threat modeling a simple application.",
  ],
  cloudPlatforms: [
    "Deploy a small project using a cloud platform.",
    "Learn the basics of storage, hosting, and permissions.",
  ],
  userEmpathy: [
    "Conduct a short user interview and summarize the findings.",
    "Practice connecting user pain points to design decisions.",
  ],
  researchMethods: [
    "Practice interviews, surveys, usability tests, and synthesis.",
    "Turn research notes into clear product recommendations.",
  ],
  visualDesign: [
    "Create interface mockups and explain layout decisions.",
    "Practice visual hierarchy, spacing, and accessibility.",
  ],
  productThinking: [
    "Write a short product spec for a feature.",
    "Practice defining users, problems, constraints, and success metrics.",
  ],
  projectManagement: [
    "Practice breaking a large project into milestones.",
    "Create a simple roadmap with risks and dependencies.",
  ],
  businessThinking: [
    "Practice connecting technical decisions to organizational goals.",
    "Summarize the value of a project for non-technical stakeholders.",
  ],
  communication: [
    "Practice writing short summaries of technical work.",
    "Prepare concise explanations for portfolio projects.",
  ],
  teamwork: [
    "Document your role clearly in group projects.",
    "Practice giving and receiving structured feedback.",
  ],
};

function normalizeGapSkill(gap) {
  if (!gap) return null;
  if (typeof gap === "string") return gap;
  return gap.skill || gap.name || gap.id || null;
}

function getCareerCourseCode(course) {
  if (typeof course === "string") return course;
  return course?.code || course?.classCode || "";
}

function getCareerCourseTitle(course) {
  if (typeof course === "string") return "";
  return course?.title || course?.name || "";
}

function formatSkillName(skill) {
  return String(skill || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function getRecommendedCoursesForGaps({
  gapSkills,
  userCourses,
  career,
  maxResults = 6,
}) {
  const normalizedUserCourses = new Set(
    userCourses.map((course) => String(course).toUpperCase())
  );

  const careerCourseCodes = new Set(
    (career?.courses || []).map((course) =>
      getCareerCourseCode(course).toUpperCase()
    )
  );

  const careerCourseTitles = new Map(
    (career?.courses || []).map((course) => [
      getCareerCourseCode(course).toUpperCase(),
      getCareerCourseTitle(course),
    ])
  );

  const gapSet = new Set(gapSkills);

  const mappedCourses = Object.entries(courseSkillMap)
    .map(([courseCode, skillMap]) => {
      const normalizedCode = String(courseCode).toUpperCase();

      if (normalizedUserCourses.has(normalizedCode)) return null;

      const helpedSkills = Object.entries(skillMap || {})
        .filter(([skill]) => gapSet.has(skill))
        .map(([skill, value]) => ({
          skill,
          value,
        }));

      if (helpedSkills.length === 0) return null;

      const baseScore = helpedSkills.reduce(
        (sum, item) => sum + Number(item.value || 0),
        0
      );

      const careerBoost = careerCourseCodes.has(normalizedCode) ? 4 : 0;

      return {
        code: courseCode,
        title: careerCourseTitles.get(normalizedCode) || "",
        helpedSkills,
        score: baseScore + careerBoost,
        isCareerRecommended: careerCourseCodes.has(normalizedCode),
      };
    })
    .filter(Boolean);

  return mappedCourses.sort((a, b) => b.score - a.score).slice(0, maxResults);
}

function getWeakQuizSignals({ career, latestQuiz }) {
  if (!career?.requiredSkills || !latestQuiz?.quizScores) return [];

  return Object.keys(career.requiredSkills)
    .map((skill) => ({
      skill,
      quizScore: latestQuiz.quizScores[skill] || 0,
      requiredLevel: career.requiredSkills[skill],
    }))
    .filter((item) => item.quizScore <= 1)
    .slice(0, 5);
}

// Builds roadmap recommendations from saved quiz and course evidence.
export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [career, setCareer] = useState(null);
  const [latestQuiz, setLatestQuiz] = useState(null);

  const [userCourses, setUserCourses] = useState([]);
  const [userSkills, setUserSkills] = useState({});
  const [careerEvaluation, setCareerEvaluation] = useState({
    strengths: [],
    gaps: [],
    fitScore: 0,
  });

  const [completedSteps, setCompletedSteps] = useState([]);

  const [hasQuiz, setHasQuiz] = useState(false);

  const [dismissQuizPrompt, setDismissQuizPrompt] = useState(
    localStorage.getItem("dismissQuizPrompt") === "1"
  );

  const location = useLocation();
  const navigate = useNavigate();

  function handleTakeQuizYes() {
    navigate("/quiz");
  }

  function handleTakeQuizNo() {
    localStorage.setItem("dismissQuizPrompt", "1");
    setDismissQuizPrompt(true);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const user = getCurrentUser();

        if (!user) {
          navigate("/");
          return;
        }

        const latestQuizData = await getLatestQuizAttempt();
        const quizDone = !!latestQuizData;
        setHasQuiz(quizDone);

        setLatestQuiz(latestQuizData);

        const careerGoalId = latestQuizData?.selectedCareerGoalId || null;

        const targetCareer = careers.find((c) => c.id === careerGoalId) || null;
        setCareer(targetCareer);

        const savedCourses = await getCurrentUserCourses();
        const courseCodes = savedCourses
          .map((course) => course.classCode)
          .filter(Boolean);

        setUserCourses(courseCodes);

        const courseSkills = inferSkills(courseCodes, courseSkillMap);
        setUserSkills(courseSkills);

        if (targetCareer) {
          const evaluation = evaluateCareer(courseSkills, targetCareer);
          setCareerEvaluation(evaluation);
        } else {
          setCareerEvaluation({
            strengths: [],
            gaps: [],
            fitScore: 0,
          });
        }

        const savedProgress = await getRoadmapProgress();

        if (savedProgress.length > 0) {
          setCompletedSteps(savedProgress);
        } else {
          const saved = JSON.parse(
            localStorage.getItem("roadmapProgress") || "[]"
          );
          setCompletedSteps(saved);
        }
      } catch (e) {
        console.error("Dashboard load failed:", e);
        setCareer(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [location, navigate]);

  const toggleStep = async (i) => {
    const updated = completedSteps.includes(i)
      ? completedSteps.filter((s) => s !== i)
      : [...completedSteps, i];

    setCompletedSteps(updated);

    try {
      const user = getCurrentUser();

      if (user) {
        await saveRoadmapProgress(updated);
      }
    } catch (e) {
      console.error("Failed to save progress:", e);
    }

    localStorage.setItem("roadmapProgress", JSON.stringify(updated));
  };

  const progressPct = career?.roadmap?.length
    ? Math.round((completedSteps.length / career.roadmap.length) * 100)
    : 0;

  const quizStepDone = hasQuiz || dismissQuizPrompt;
  const showQuizPrompt = !loading && !quizStepDone;

  const gapSkills = useMemo(() => {
    return (careerEvaluation.gaps || [])
      .map(normalizeGapSkill)
      .filter(Boolean);
  }, [careerEvaluation.gaps]);

  const alignedStrengths = useMemo(() => {
    return (careerEvaluation.strengths || []).slice(0, 5);
  }, [careerEvaluation.strengths]);

  const recommendedGapCourses = useMemo(() => {
    return getRecommendedCoursesForGaps({
      gapSkills,
      userCourses,
      career,
      maxResults: 6,
    });
  }, [gapSkills, userCourses, career]);

  const weakQuizSignals = useMemo(() => {
    return getWeakQuizSignals({ career, latestQuiz });
  }, [career, latestQuiz]);

  const topGapResources = useMemo(() => {
    return gapSkills.slice(0, 3).map((skill) => ({
      skill,
      suggestions: resourceSuggestions[skill] || [
        `Build a small project that demonstrates ${formatSkillName(skill)}.`,
        `Add evidence of ${formatSkillName(skill)} to your portfolio.`,
      ],
    }));
  }, [gapSkills]);

  const hasDetectedSkills = Object.keys(userSkills).length > 0;

  return (
    <>
      <div className="alumni-header dashboard-compact-header">
        <div className="header-content">
          <p className="dashboard-small-context">
            {career ? (
              <>
                Current goal: <strong>{career.title}</strong>
              </>
            ) : (
              "Career Dashboard"
            )}
          </p>

          <h1 className="page-title">Your Roadmap</h1>

          <p className="page-subtitle">
            Focus on the next steps, skills, and courses that move you closer to
            your goal.
          </p>
        </div>
      </div>

      <div className="dashboard-body dashboard-focused-body">
        {loading && <div className="dashboard-loading">Loading…</div>}

        {showQuizPrompt && (
          <div className="dashboard-onboarding">
            <div className="dashboard-onboarding-hero">
              <div className="dashboard-empty-emoji">🎯</div>

              <p className="dashboard-onboarding-kicker">
                Welcome to Career Dashboard
              </p>

              <h2 className="dashboard-empty-title">
                Let’s build your career roadmap.
              </h2>

              <p className="dashboard-empty-desc dashboard-onboarding-desc">
                This tool helps you choose a career direction, understand how
                your Informatics coursework connects to that goal, and plan your
                next steps. To get started, select a career directly or take a
                short quiz to explore possible paths.
              </p>
            </div>

            <div className="dashboard-flow-grid">
              <div className="dashboard-flow-step">
                <div className="dashboard-flow-number">1</div>
                <h3>Start with your goal</h3>
                <p>
                  Pick a career if you already know what you want, or use the
                  quiz to find options that match your interests.
                </p>
              </div>

              <div className="dashboard-flow-step">
                <div className="dashboard-flow-number">2</div>
                <h3>Add your coursework</h3>
                <p>
                  Upload your degree audit so the dashboard can recognize
                  courses you have already taken. You can also skip this for now.
                </p>
              </div>

              <div className="dashboard-flow-step">
                <div className="dashboard-flow-number">3</div>
                <h3>See your roadmap</h3>
                <p>
                  View your selected career, recommended courses, useful skills,
                  and suggested next steps.
                </p>
              </div>
            </div>

            <div className="dashboard-onboarding-note">
              <strong>How it works:</strong> Your career goal comes from your
              choice or quiz result. Your audit only helps personalize the
              roadmap by showing strengths and gaps.
            </div>

            <div className="dashboard-onboarding-actions">
              <button className="btn btn-primary" onClick={handleTakeQuizYes}>
                Start Career Quiz →
              </button>

              <button className="btn" onClick={() => navigate("/quiz?skip=1")}>
                I already know my career goal →
              </button>

              <button className="btn btn-subtle" onClick={handleTakeQuizNo}>
                Not now
              </button>
            </div>
          </div>
        )}

        {!loading && !showQuizPrompt && !career && (
          <div className="dashboard-empty">
            <div className="dashboard-empty-emoji">🎯</div>
            <h2 className="dashboard-empty-title">No career goal selected</h2>
            <p className="dashboard-empty-desc">
              Choose a career goal before viewing your roadmap.
            </p>

            <button className="btn btn-primary" onClick={() => navigate("/quiz")}>
              Choose Career →
            </button>
          </div>
        )}

        {!loading && !showQuizPrompt && career && (
          <>
            <section className="dashboard-goal-strip">
              <div className="dashboard-goal-left">
                <span className="dashboard-goal-emoji">
                  {career.emoji || "🎯"}
                </span>

                <div>
                  <p className="dashboard-goal-label">Career goal</p>
                  <h2>{career.title}</h2>
                </div>
              </div>

              <div className="dashboard-goal-actions">
                <button className="btn" onClick={() => navigate("/profile")}>
                  View Profile
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/quiz")}
                >
                  Change Goal
                </button>
              </div>
            </section>

            <section className="dash-card dashboard-focus-card">
              <div className="dashboard-focus-header">
                <div>
                  <p className="dash-section-label">Focus Areas</p>

                  <h2>What this dashboard is looking at</h2>

                  <p className="dash-section-sub">
                    Your dashboard separates your chosen career from the evidence
                    we have about you. Coursework helps identify skills you have
                    already built and gaps to work on. Quiz answers can point to
                    interests worth exploring, but they are not treated as proof
                    of skill.
                  </p>
                </div>

                <div className="dashboard-focus-progress">
                  <strong>{progressPct}%</strong>
                  <span>
                    {completedSteps.length} of {career.roadmap.length} roadmap
                    steps complete
                  </span>

                  <div className="dashboard-mini-progress-track">
                    <div
                      className="dashboard-mini-progress-fill"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="dashboard-focus-grid">
                <div className="dashboard-focus-block">
                  <h3>Skills to build</h3>

                  <p>
                    These come from comparing your saved coursework against the
                    skills needed for {career.title}.
                  </p>

                  {hasDetectedSkills ? (
                    gapSkills.length > 0 ? (
                      <div className="dashboard-gap-pill-list">
                        {gapSkills.slice(0, 6).map((skill) => (
                          <span key={skill} className="dashboard-gap-pill">
                            {formatSkillName(skill)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="dashboard-focus-empty">
                        No major course-based gaps detected yet.
                      </p>
                    )
                  ) : (
                    <div>
                      <p className="dashboard-focus-empty">
                        Upload your audit to calculate course-based skill gaps.
                      </p>

                      <button
                        className="btn btn-primary"
                        onClick={() => navigate("/parse")}
                        style={{ marginTop: 12 }}
                      >
                        Upload Audit →
                      </button>
                    </div>
                  )}
                </div>

                <div className="dashboard-focus-block">
                  <h3>Current strengths</h3>

                  <p>
                    These are skills your completed or saved courses already
                    support.
                  </p>

                  {alignedStrengths.length > 0 ? (
                    <div className="dashboard-strength-list">
                      {alignedStrengths.map((skill) => (
                        <span key={skill} className="dashboard-strength-pill">
                          {formatSkillName(skill)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="dashboard-focus-empty">
                      Add course data to see strengths aligned with this career.
                    </p>
                  )}
                </div>

                <div className="dashboard-focus-block">
                  <h3>Interests to explore</h3>

                  <p>
                    These come from quiz areas with lower signal. They are not
                    weaknesses, just topics to explore if this career still
                    interests you.
                  </p>

                  {weakQuizSignals.length > 0 ? (
                    <div className="dashboard-gap-pill-list">
                      {weakQuizSignals.map((item) => (
                        <span key={item.skill} className="dashboard-soft-pill">
                          {formatSkillName(item.skill)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="dashboard-focus-empty">
                      No low quiz-signal areas detected, or this career was
                      chosen directly.
                    </p>
                  )}
                </div>

                <div className="dashboard-focus-block dashboard-practice-block">
                  <h3>Practice next</h3>

                  <p>
                    These are small actions connected to your current skill gaps.
                  </p>

                  {topGapResources.length > 0 ? (
                    <div className="dashboard-resource-list">
                      {topGapResources.map((group) => (
                        <div
                          key={group.skill}
                          className="dashboard-resource-item"
                        >
                          <strong>{formatSkillName(group.skill)}</strong>

                          <ul>
                            {group.suggestions.slice(0, 2).map((suggestion) => (
                              <li key={suggestion}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="dashboard-focus-empty">
                      Once gaps are detected, this area will suggest focused
                      practice ideas.
                    </p>
                  )}

                  <button
                    className="btn profile-full-btn"
                    onClick={() => navigate("/resources")}
                  >
                    Browse Resources
                  </button>
                </div>
              </div>
            </section>

            <section className="dash-card dash-roadmap-card dashboard-main-roadmap">
              <div className="dashboard-roadmap-header">
                <div>
                  <p className="dash-section-label">Main Roadmap</p>
                  <h2>Your Roadmap to {career.title}</h2>

                  <p className="dash-section-sub">
                    Click each step as you make progress. This is the main plan
                    your dashboard is tracking.
                  </p>
                </div>

                <div className="dashboard-roadmap-progress-badge">
                  {progressPct}%
                </div>
              </div>

              <ol className="dash-roadmap-list dashboard-roadmap-large">
                {career.roadmap.map((step, i) => (
                  <li
                    key={i}
                    className={`dash-roadmap-item${
                      completedSteps.includes(i) ? " done" : ""
                    }`}
                    onClick={() => toggleStep(i)}
                  >
                    <div className="dash-roadmap-check" aria-hidden="true">
                      {completedSteps.includes(i) ? "✓" : i + 1}
                    </div>

                    <span className="dash-roadmap-text">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="dash-card dash-courses-card">
              <div className="dash-section-label">Recommended Courses</div>

              <h3>Courses that target your gaps</h3>

              <p className="dash-section-sub">
                These are chosen by comparing your course-based gaps to the
                skills each course supports.
              </p>

              {recommendedGapCourses.length > 0 ? (
                <div className="dash-course-list dashboard-gap-course-list">
                  {recommendedGapCourses.map((course) => (
                    <div key={course.code} className="dash-course-item">
                      <div className="dashboard-course-topline">
                        <div>
                          <div className="dash-course-code">{course.code}</div>

                          {course.title && (
                            <div className="dash-course-title">
                              {course.title}
                            </div>
                          )}
                        </div>

                        {course.isCareerRecommended && (
                          <span className="dashboard-course-badge">
                            Career rec
                          </span>
                        )}
                      </div>

                      <div className="dashboard-course-skills">
                        Helps with:{" "}
                        {course.helpedSkills
                          .map((item) => formatSkillName(item.skill))
                          .join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : hasDetectedSkills ? (
                <p className="dash-section-sub" style={{ marginTop: 14 }}>
                  No gap-based course recommendations were found from the
                  current course-skill map. Check your Profile or browse general
                  course recommendations.
                </p>
              ) : (
                <div style={{ marginTop: 14 }}>
                  <p className="dash-section-sub">
                    Upload your audit to generate gap-based course
                    recommendations.
                  </p>

                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/parse")}
                    style={{ marginTop: 12 }}
                  >
                    Upload Audit →
                  </button>
                </div>
              )}
            </section>

            <section className="dash-card dash-links-card dashboard-quick-access-bottom">
              <div className="dash-section-label">Quick Access</div>

              <div className="dash-quick-links">
                {quickLinks.map((l) => (
                  <a key={l.label} href={l.href} className="dash-quick-link">
                    <span className="dash-ql-emoji">{l.emoji}</span>

                    <div>
                      <div className="dash-ql-label">{l.label}</div>
                      <div className="dash-ql-desc">{l.desc}</div>
                    </div>

                    <span className="dash-ql-arrow">→</span>
                  </a>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
