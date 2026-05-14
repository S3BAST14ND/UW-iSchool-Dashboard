import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

import {
    getCurrentUser,
    getCurrentUserCourses,
    getLatestQuizAttempt,
    updateCurrentUserProfile,
} from "../utils/localStore";

import { careers } from "../data/careers";
import { courseSkillMap } from "../data/courseSkillMap";
import { inferSkills } from "../utils/inferSkills";
import { getRankedQuizResults } from "../utils/quizEngine";

function getSelectionSourceLabel(source) {
    if (source === "direct") return "Career chosen directly";
    if (source === "quiz") return "Career chosen from quiz results";
    if (!source) return "No career selected yet";
    return source;
}

// Summarizes the demo user's saved goal, courses, and skill signals.
export default function Profile() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [latestQuiz, setLatestQuiz] = useState(null);
    const [courses, setCourses] = useState([]);
    const [skillProfile, setSkillProfile] = useState({});
    const [error, setError] = useState("");

    const [displayName, setDisplayName] = useState("");
    const [draftDisplayName, setDraftDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const [savingName, setSavingName] = useState(false);
    const plannedCourses = [];

    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            setError("");

            try {
                const user = getCurrentUser();

                if (!user) {
                    navigate("/");
                    return;
                }

                const userName = user.displayName || "";
                setDisplayName(userName);
                setDraftDisplayName(userName);
                setEmail(user.email || "");

                const quizData = await getLatestQuizAttempt();
                setLatestQuiz(quizData);

                const savedCourses = (await getCurrentUserCourses())
                    .filter((course) => course.classCode);

                setCourses(savedCourses);

                const courseCodes = savedCourses.map((course) => course.classCode);
                setSkillProfile(inferSkills(courseCodes, courseSkillMap));
            } catch (err) {
                console.error("Failed to load profile:", err);
                setError("Could not load your profile data.");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [navigate]);

    const selectedCareer = useMemo(() => {
        if (!latestQuiz?.selectedCareerGoalId) return null;

        return careers.find(
            (career) => career.id === latestQuiz.selectedCareerGoalId
        );
    }, [latestQuiz]);

    const topCourseSkills = useMemo(() => {
        return Object.entries(skillProfile)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
    }, [skillProfile]);

    const topQuizSignals = useMemo(() => {
        return Object.entries(latestQuiz?.quizScores || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
    }, [latestQuiz]);

    const rankedQuizResults = useMemo(() => {
        if (!latestQuiz?.quizScores) return [];
        return getRankedQuizResults(latestQuiz.quizScores).slice(0, 3);
    }, [latestQuiz]);

    const uploadedAudit = courses.length > 0;

    function formatDate(timestamp) {
        if (!timestamp) return "Not available";
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleDateString();
    }

    async function handleSaveName() {
        const user = getCurrentUser();
        if (!user) return;

        try {
            setSavingName(true);
            const cleanedName = draftDisplayName.trim();

            await updateCurrentUserProfile({
                displayName: cleanedName,
            });

            setDisplayName(cleanedName);
            setDraftDisplayName(cleanedName);
            setIsEditingName(false);
        } catch (err) {
            console.error("Failed to update name:", err);
            setError("Could not update your name.");
        } finally {
            setSavingName(false);
        }
    }

    if (loading) {
        return (
            <>
                <div className="alumni-header">
                    <div className="header-content">
                        <h1 className="page-title">Profile</h1>
                        <p className="page-subtitle">Loading your career profile...</p>
                    </div>
                </div>

                <div className="profile-body">
                    <div className="profile-card">
                        <p className="profile-muted">Loading...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="alumni-header">
                <div className="header-content">
                    <h1 className="page-title">Profile</h1>
                    <p className="page-subtitle">
                        View and update the information your dashboard is using
                    </p>
                </div>
            </div>

            <div className="profile-body">
                {error && <div className="profile-error">{error}</div>}

                <section className="profile-hero-card">
                    <div className="profile-identity-block">
                        <p className="profile-kicker">Career Profile</p>

                        <h2>Welcome{displayName ? `, ${displayName}` : ""}</h2>

                        <p className="profile-muted">
                            This profile stores your selected career goal, quiz-based
                            interests, and course-based skill evidence.
                        </p>

                        <div className="profile-account-row">
                            <div>
                                <span className="profile-small-label">Name</span>

                                {isEditingName ? (
                                    <div className="profile-name-edit-row">
                                        <input
                                            className="profile-name-input"
                                            value={draftDisplayName}
                                            onChange={(e) => setDraftDisplayName(e.target.value)}
                                            placeholder="Enter your name"
                                        />

                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSaveName}
                                            disabled={savingName}
                                        >
                                            {savingName ? "Saving..." : "Save"}
                                        </button>

                                        <button
                                            className="btn"
                                            onClick={() => {
                                                setDraftDisplayName(displayName);
                                                setIsEditingName(false);
                                            }}
                                            disabled={savingName}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="profile-account-value-row">
                                        <strong>{displayName || "No name set"}</strong>
                                        <button
                                            className="profile-inline-btn"
                                            onClick={() => setIsEditingName(true)}
                                        >
                                            Change
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <span className="profile-small-label">Email</span>
                                <strong>{email || "No email available"}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="profile-career-summary-box">
                        <p className="profile-kicker">Current Goal</p>

                        {selectedCareer ? (
                            <>
                                <div className="profile-current-career">
                                    <span className="profile-current-career-emoji">
                                        {selectedCareer.emoji || "🎯"}
                                    </span>

                                    <div>
                                        <h3>{selectedCareer.title}</h3>
                                        <p>{getSelectionSourceLabel(latestQuiz?.selectionSource)}</p>
                                    </div>
                                </div>

                                <div className="profile-focus-row">
                                    {selectedCareer.focus && (
                                        <span className="profile-status-pill">
                                            {selectedCareer.focus}
                                        </span>
                                    )}

                                    {selectedCareer.type && (
                                        <span className="profile-status-pill muted-pill">
                                            {selectedCareer.type}
                                        </span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className="profile-muted">No career selected yet.</p>
                        )}

                        <button
                            className="btn btn-primary profile-full-btn"
                            onClick={() => navigate("/quiz")}
                        >
                            Change Career
                        </button>
                    </div>
                </section>

                <section className="profile-section-heading">
                    <p className="profile-kicker">Quiz Profile</p>
                    <h2>What your quiz says about your interests</h2>
                    <p>
                        This section comes from your quiz answers. It reflects what kinds of
                        work, topics, and career directions you seem interested in.
                    </p>
                </section>

                <section className="profile-grid">
                    <article className="profile-card">
                        <p className="profile-kicker">Latest Quiz</p>
                        <h3>Quiz summary</h3>

                        <p className="profile-muted">
                            Completed: <strong>{formatDate(latestQuiz?.createdAt)}</strong>
                        </p>

                        <p className="profile-muted">
                            Source:{" "}
                            <strong>
                                {getSelectionSourceLabel(latestQuiz?.selectionSource)}
                            </strong>
                        </p>

                        <button
                            className="btn profile-full-btn"
                            onClick={() => navigate("/quiz")}
                        >
                            Retake Quiz
                        </button>
                    </article>

                    <article className="profile-card">
                        <p className="profile-kicker">Interest Signals</p>
                        <h3>Top quiz signals</h3>

                        {topQuizSignals.length > 0 ? (
                            <div className="profile-mini-list small">
                                {topQuizSignals.map(([skill, value]) => (
                                    <div key={skill} className="profile-mini-row">
                                        <span>{skill}</span>
                                        <strong>{value}</strong>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="profile-muted">
                                No quiz signals yet. Take the quiz to build this part of your
                                profile.
                            </p>
                        )}
                    </article>

                    <article className="profile-card profile-card-large">
                        <p className="profile-kicker">Career Matches</p>
                        <h3>Top matches from quiz</h3>

                        {rankedQuizResults.length > 0 ? (
                            <div className="profile-match-grid">
                                {rankedQuizResults.map((result) => (
                                    <div key={result.careerId} className="profile-match-card">
                                        <span>{result.title}</span>
                                        <strong>{result.score}%</strong>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="profile-muted">
                                No quiz matches yet. Your selected career can still be chosen
                                directly.
                            </p>
                        )}
                    </article>
                </section>

                <section className="profile-section-heading course-section-heading">
                    <p className="profile-kicker">Course Profile</p>
                    <h2>What your audit says about your coursework</h2>
                    <p>
                        This section comes from your degree audit. It is used to detect
                        completed courses, course-based skills, and eventually planned
                        courses.
                    </p>
                </section>

                <section className="profile-grid">
                    <article className="profile-card">
                        <p className="profile-kicker">Degree Audit</p>
                        <h3>Course data</h3>

                        <div className="profile-stat">
                            <span className="profile-stat-number">{courses.length}</span>
                            <span className="profile-muted">completed courses</span>
                        </div>

                        <p className="profile-muted">
                            {uploadedAudit
                                ? "Your audit has been saved and is being used for course-based skill evidence."
                                : "Upload your degree audit to make your profile more personalized."}
                        </p>

                        <button
                            className="btn profile-full-btn"
                            onClick={() => navigate("/parse?mode=reupload")}
                        >
                            {uploadedAudit ? "Re-upload Audit" : "Upload Audit"}
                        </button>
                    </article>

                    <article className="profile-card">
                        <p className="profile-kicker">Course Skill Evidence</p>
                        <h3>Skills from completed courses</h3>

                        {topCourseSkills.length > 0 ? (
                            <div className="profile-skill-list">
                                {topCourseSkills.map(([skill, value]) => (
                                    <SkillBar key={skill} label={skill} value={value} />
                                ))}
                            </div>
                        ) : (
                            <EmptyProfileState
                                title="No course skills yet"
                                text="Upload your audit to infer skills from completed coursework."
                                actionText="Upload Audit"
                                onAction={() => navigate("/parse?mode=reupload")}
                            />
                        )}
                    </article>

                    <article className="profile-card profile-card-large">
                        <div className="profile-card-header">
                            <div>
                                <p className="profile-kicker">Planned Courses</p>
                                <h3>Courses to add later</h3>
                                <p className="profile-muted">
                                    Soon, planned courses from your audit can appear here. When
                                    you complete one, you will be able to add it to your completed
                                    course profile.
                                </p>
                            </div>
                        </div>

                        {plannedCourses.length > 0 ? (
                            <div className="profile-planned-grid">
                                {plannedCourses.map((course) => (
                                    <div key={course.classCode} className="profile-planned-card">
                                        <div>
                                            <strong>{course.classCode}</strong>
                                            {course.title && <span>{course.title}</span>}
                                        </div>

                                        <button className="btn btn-primary">
                                            Mark Completed
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="profile-planned-placeholder">
                                <div>
                                    <h4>No planned courses detected yet</h4>
                                    <p>
                                        After planned-course parsing is added, this area can show
                                        courses from future quarters with a quick “Mark Completed”
                                        action.
                                    </p>
                                </div>

                                <button className="btn" onClick={() => navigate("/parse?mode=reupload")}>
                                    Re-upload Audit
                                </button>
                            </div>
                        )}
                    </article>

                    <article className="profile-card profile-card-large profile-courses-small">
                        <div className="profile-card-header">
                            <div>
                                <p className="profile-kicker">Saved Courses</p>
                                <h3>Completed audit courses</h3>
                            </div>

                        </div>

                        {courses.length > 0 ? (
                            <div className="profile-course-grid compact">
                                {courses.slice(0, 12).map((course) => (
                                    <div key={course.id} className="profile-course-chip compact">
                                        <strong>{course.classCode}</strong>
                                    </div>
                                ))}

                                {courses.length > 12 && (
                                    <div className="profile-course-chip compact profile-muted">
                                        +{courses.length - 12} more
                                    </div>
                                )}
                            </div>
                        ) : (
                            <EmptyProfileState
                                title="No saved courses"
                                text="Your completed audit courses will appear here after upload."
                                actionText="Upload Audit"
                                onAction={() => navigate("/parse?mode=reupload")}
                            />
                        )}
                    </article>
                </section>
            </div>
        </>
    );
}

function SkillBar({ label, value }) {
    const safeValue = Math.max(0, Number(value) || 0);
    const width = Math.min(100, safeValue * 12);

    return (
        <div className="profile-skill-row">
            <div className="profile-skill-top">
                <span>{label}</span>
                <strong>{safeValue}</strong>
            </div>

            <div className="profile-skill-track">
                <div className="profile-skill-fill" style={{ width: `${width}%` }} />
            </div>
        </div>
    );
}

function EmptyProfileState({ title, text, actionText, onAction }) {
    return (
        <div className="profile-empty-state">
            <h4>{title}</h4>
            <p>{text}</p>
            {actionText && (
                <button className="btn" onClick={onAction}>
                    {actionText}
                </button>
            )}
        </div>
    );
}
