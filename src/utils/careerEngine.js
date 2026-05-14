export function evaluateCareer(userSkills, career) {
  let totalRequired = 0;
  let totalMatched = 0;

  const strengths = [];
  const gaps = [];

  for (const [skill, requiredLevel] of Object.entries(career.requiredSkills)) {
    const userLevel = userSkills[skill] || 0;

    totalRequired += requiredLevel;
    totalMatched += Math.min(userLevel, requiredLevel);

    const gap = requiredLevel - userLevel;

    if (gap <= 0) {
      strengths.push(skill);
    } else {
      gaps.push({ skill, gap });
    }
  }

  const fitScore =
    totalRequired === 0 ? 0 : Math.round((totalMatched / totalRequired) * 100);

  return {
    fitScore,
    strengths,
    gaps,
  };
}