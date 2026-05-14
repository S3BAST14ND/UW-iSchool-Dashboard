import { careers } from "../data/careers";

export function calculateQuizScores(answersByQuestionId, questions) {
  const scores = {};

  for (const question of questions) {
    const selectedOptionId = answersByQuestionId[question.id];
    if (!selectedOptionId) continue;

    if (!Array.isArray(question.options)) continue;

    const selectedOption = question.options.find(
      (option) => option.id === selectedOptionId
    );

    if (!selectedOption) continue;

    for (const [skillId, points] of Object.entries(selectedOption.scores || {})) {
      scores[skillId] = (scores[skillId] || 0) + points;
    }
  }

  return scores;
}

export function getCareerScoresFromQuiz(skillScores) {
  return careers
    .map((career) => {
      let totalRequired = 0;
      let matched = 0;

      for (const [skill, requiredLevel] of Object.entries(
        career.requiredSkills || {}
      )) {
        totalRequired += requiredLevel;

        const quizValue = skillScores[skill] || 0;
        matched += Math.min(quizValue, requiredLevel);
      }

      const score =
        totalRequired === 0
          ? 0
          : Math.round((matched / totalRequired) * 100);

      return {
        careerId: career.id,
        title: career.title,
        focus: career.focus,
        type: career.type,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function getRankedQuizResults(skillScores) {
  return getCareerScoresFromQuiz(skillScores);
}

export function shouldAskQuestion(question, answersByQuestionId, rankedResults) {
  if (!question.askedWhen) return true;

  if (question.askedWhen.anyOf) {
    return question.askedWhen.anyOf.some((condition) => {
      if (condition.questionId && condition.optionIds) {
        return condition.optionIds.includes(
          answersByQuestionId[condition.questionId]
        );
      }

      if (condition.questionId && condition.optionId) {
        return answersByQuestionId[condition.questionId] === condition.optionId;
      }

      return false;
    });
  }

  if (question.askedWhen.questionId && question.askedWhen.optionIds) {
    return question.askedWhen.optionIds.includes(
      answersByQuestionId[question.askedWhen.questionId]
    );
  }

  if (question.askedWhen.questionId && question.askedWhen.optionId) {
    return (
      answersByQuestionId[question.askedWhen.questionId] ===
      question.askedWhen.optionId
    );
  }

  if (question.askedWhen.anyTopFocusIn) {
    const meaningfulResults = rankedResults.filter((result) => result.score > 0);
    if (meaningfulResults.length === 0) return false;

    const topFocuses = meaningfulResults
      .slice(0, 5)
      .map((result) => result.focus);

    return question.askedWhen.anyTopFocusIn.some((focus) =>
      topFocuses.includes(focus)
    );
  }

  if (question.askedWhen.anyTopCareerIn) {
    const meaningfulResults = rankedResults.filter((result) => result.score > 0);
    if (meaningfulResults.length === 0) return false;

    const topCareerIds = meaningfulResults
      .slice(0, 5)
      .map((result) => result.careerId);

    return question.askedWhen.anyTopCareerIn.some((id) =>
      topCareerIds.includes(id)
    );
  }

  return true;
}