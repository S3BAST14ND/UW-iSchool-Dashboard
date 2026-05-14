import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { quizQuestions } from "../data/quizQuestions";
import { careers } from "../data/careers";
import {
  calculateQuizScores,
  getRankedQuizResults,
  shouldAskQuestion,
} from "../utils/quizEngine";
import "../index.css";

import {
  getCurrentUser,
  saveQuizAttempt,
} from "../utils/localStore";

// Persists the selected career goal so dashboard and profile can read it later.
async function saveQuizAttemptLocally({
  answersByQuestionId,
  rankedResults,
  quizScores,
  selectedCareerGoalId,
  selectionSource,
}) {
  const user = getCurrentUser();
  if (!user) throw new Error("Not signed in.");

  await saveQuizAttempt({
    answersByQuestionId,
    rankedResults,
    quizScores,
    selectedCareerGoalId,
    selectionSource,
  });
}

const Quiz = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const directMode =
    searchParams.get("mode") === "direct" || searchParams.get("skip") === "1";

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answersByQuestionId, setAnswersByQuestionId] = useState({});
  const [careerSearch, setCareerSearch] = useState("");

  const [selectedFinalCareerId, setSelectedFinalCareerId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingSelectionSource, setPendingSelectionSource] = useState(null);
  const [reviewCareerId, setReviewCareerId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const quizScores = calculateQuizScores(answersByQuestionId, quizQuestions);
  const rankedResults = getRankedQuizResults(quizScores);

  const visibleQuestions = quizQuestions.filter((question) =>
    shouldAskQuestion(question, answersByQuestionId, rankedResults)
  );

  const currentQuestion = visibleQuestions[currentQuestionIndex];

  const isFinalCareerSelection =
    currentQuestion?.type === "career-results-picker";

  const currentAnswer = currentQuestion
    ? answersByQuestionId[currentQuestion.id]
    : null;

  const progressPercent =
    visibleQuestions.length > 0
      ? Math.round(((currentQuestionIndex + 1) / visibleQuestions.length) * 100)
      : 0;

  const careerOptions = careers.filter((career) => {
    const search = careerSearch.trim().toLowerCase();
    if (!search) return true;

    return (
      career.title.toLowerCase().includes(search) ||
      career.focus?.toLowerCase().includes(search) ||
      career.type?.toLowerCase().includes(search) ||
      career.displaySkills?.some((skill) =>
        skill.toLowerCase().includes(search)
      )
    );
  });

  const selectedCareer = careers.find(
    (career) => career.id === reviewCareerId
  );

  const selectOption = (optionId) => {
    if (!currentQuestion) return;

    setAnswersByQuestionId((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };
  useEffect(() => {
    if (!directMode) return;

    setAnswersByQuestionId((prev) => {
      if (prev.has_career_in_mind === "yes") return prev;

      return {
        ...prev,
        has_career_in_mind: "yes",
      };
    });
  }, [directMode]);
  useEffect(() => {
    if (!directMode) return;
    if (visibleQuestions.length === 0) return;

    const careerPickerIndex = visibleQuestions.findIndex(
      (question) => question.type === "career-picker"
    );

    if (
      careerPickerIndex !== -1 &&
      currentQuestionIndex !== careerPickerIndex
    ) {
      setCurrentQuestionIndex(careerPickerIndex);
    }
  }, [directMode, visibleQuestions.length, currentQuestionIndex]);

  const saveAndContinueToAudit = async ({
    selectedCareerGoalId,
    selectionSource,
  }) => {
    if (!selectedCareerGoalId) {
      console.error("No career selected.");
      return;
    }

    try {
      setIsSaving(true);

      await saveQuizAttemptLocally({
        answersByQuestionId,
        rankedResults,
        quizScores,
        selectedCareerGoalId,
        selectionSource,
      });

      navigate("/parse?mode=reupload", { replace: true });
    } catch (e) {
      console.error("Quiz save failed:", e);
      setIsSaving(false);
    }
  };

  const openConfirmation = ({ careerId, selectionSource }) => {
    if (!careerId) return;

    setReviewCareerId(careerId);
    setPendingSelectionSource(selectionSource);
    setShowConfirmation(true);
  };

  const handleFinalizeCareer = async () => {
    const careerId = reviewCareerId;

    const source = pendingSelectionSource || "quiz";

    await saveAndContinueToAudit({
      selectedCareerGoalId: careerId,
      selectionSource: source,
    });
  };

  const nextQuestion = async () => {
    if (!currentQuestion) return;
    if (isFinalCareerSelection) {
      openConfirmation({
        careerId: selectedFinalCareerId,
        selectionSource: "quiz",
      });
      return;
    }
    if (currentQuestion.id === "career_goal_picker") {
      openConfirmation({
        careerId: answersByQuestionId.career_goal_picker,
        selectionSource: "direct",
      });
      return;
    }
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (!currentQuestion) {
    return <div className="quiz-body">No quiz questions available.</div>;
  }

  return (
    <div className="quiz-page">
      <div className="alumni-header">
        <div className="header-content">
          <h1 className="page-title">Career Quiz</h1>
          <p className="page-subtitle">
            Choose a career goal or explore possible paths
          </p>
        </div>
      </div>

      <div className="quiz-body">
        <div className="progress-header">
          <span className="progress-text">
            Question <strong>{currentQuestionIndex + 1}</strong> of{" "}
            <strong>{visibleQuestions.length}</strong>
          </span>
          <span className="progress-percentage">{progressPercent}%</span>
        </div>

        <div
          className="progress-bar-container"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <h1 className="question-title">{currentQuestion.question}</h1>

        {isFinalCareerSelection ? (
          <div className="options-container">
            <p style={{ marginBottom: 16, color: "var(--color-text-muted)" }}>
              Based on your answers, here are some careers that may fit your
              interests. Choose one to build your roadmap around.
            </p>

            {rankedResults.slice(0, 5).map((result, index) => {
              const career = careers.find((c) => c.id === result.careerId);

              return (
                <button
                  key={result.careerId}
                  className={`option${selectedFinalCareerId === result.careerId ? " selected" : ""
                    }`}
                  onClick={() => setSelectedFinalCareerId(result.careerId)}
                  aria-pressed={selectedFinalCareerId === result.careerId}
                >
                  <div className="radio-button" aria-hidden="true">
                    <div className="radio-button-inner" />
                  </div>

                  <span className="option-text" style={{ flex: 1 }}>
                    {index === 0 ? "Top match: " : ""}
                    {career?.emoji ? `${career.emoji} ` : ""}
                    {result.title}
                  </span>

                  <span
                    style={{
                      fontWeight: "bold",
                      color:
                        selectedFinalCareerId === result.careerId
                          ? "var(--color-primary)"
                          : "var(--color-text-muted)",
                    }}
                  >
                    {result.score}%
                  </span>
                </button>
              );
            })}
          </div>
        ) : currentQuestion.type === "career-picker" ? (
          <div className="options-container">
            <p style={{ marginBottom: 16, color: "var(--color-text-muted)" }}>
              Select the career you want your dashboard to build around. You can
              always change this later.
            </p>

            <input
              type="text"
              placeholder="Search careers..."
              value={careerSearch}
              onChange={(e) => setCareerSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 12,
                border: "1.5px solid var(--color-border)",
                marginBottom: 16,
                fontSize: 15,
              }}
            />

            {careerOptions.map((career) => (
              <button
                key={career.id}
                className={`option${currentAnswer === career.id ? " selected" : ""
                  }`}
                onClick={() => selectOption(career.id)}
                aria-pressed={currentAnswer === career.id}
              >
                <div className="radio-button" aria-hidden="true">
                  <div className="radio-button-inner" />
                </div>

                <div style={{ flex: 1 }}>
                  <span className="option-text">
                    {career.emoji ? `${career.emoji} ` : ""}
                    {career.title}
                    {career.type === "broad" ? " — broad direction" : ""}
                  </span>

                  {career.requiredSkills && (
                    <div
                      style={{
                        marginTop: 6,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                      }}
                    >
                      {Object.keys(career.requiredSkills)
                        .slice(0, 4)
                        .map((skill) => (
                          <span
                            key={skill}
                            style={{
                              fontSize: 11,
                              padding: "2px 6px",
                              background: "var(--color-bg-secondary)",
                              borderRadius: 10,
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {skill}
                          </span>
                        ))}

                      {Object.keys(career.requiredSkills).length > 4 && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          +{Object.keys(career.requiredSkills).length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}

            {careerOptions.length === 0 && (
              <p style={{ color: "var(--color-text-muted)", marginTop: 12 }}>
                No careers match that search.
              </p>
            )}
          </div>
        ) : (
          <div className="options-container">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                className={`option${currentAnswer === option.id ? " selected" : ""
                  }`}
                onClick={() => selectOption(option.id)}
                aria-pressed={currentAnswer === option.id}
              >
                <div className="radio-button" aria-hidden="true">
                  <div className="radio-button-inner" />
                </div>

                <span className="option-text">{option.text}</span>
              </button>
            ))}
          </div>
        )}

        <div className="button-container">
          {currentQuestionIndex > 0 && (
            <button className="btn btn-prev" onClick={previousQuestion}>
              Previous
            </button>
          )}

          <button
            className="btn btn-next"
            onClick={nextQuestion}
            disabled={
              isFinalCareerSelection
                ? !selectedFinalCareerId
                : !currentAnswer
            }
          >
            {currentQuestion.id === "career_goal_picker"
              ? "Review Career"
              : isFinalCareerSelection
                ? "Review Selected Career"
                : currentQuestionIndex === visibleQuestions.length - 1
                  ? "Finish Quiz"
                  : "Next"}
          </button>
        </div>
      </div>

      {showConfirmation && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!isSaving) setShowConfirmation(false);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {selectedCareer?.emoji || "🎯"}
              </div>

              <h2 style={{ marginBottom: 8 }}>Confirm Career Goal</h2>

              <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
                You selected{" "}
                <strong>{selectedCareer?.title || "this career"}</strong> as
                your career goal.
              </p>

              <p
                style={{
                  fontSize: 14,
                  color: "var(--color-text-muted)",
                  marginBottom: 24,
                }}
              >
                Next, you can upload your degree audit so the dashboard can
                compare your coursework to this path. You can also skip that
                step for now.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  className="btn btn-prev"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isSaving}
                >
                  Change Selection
                </button>

                <button
                  className="btn btn-next"
                  onClick={handleFinalizeCareer}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Continue to Audit Step"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
