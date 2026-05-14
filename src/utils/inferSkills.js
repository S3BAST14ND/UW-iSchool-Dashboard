export function inferSkills(userCourses, courseSkillMap) {
  const skills = {};

  for (const course of userCourses) {
    const mapping = courseSkillMap[course];
    if (!mapping) continue;

    for (const [skill, value] of Object.entries(mapping)) {
      skills[skill] = (skills[skill] || 0) + value;
    }
  }

  return skills;
}