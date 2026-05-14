export const CAREERS = {
  DATA_ANALYST: "dataAnalyst",
  UX_DESIGNER: "uxDesigner",
  SOFTWARE_ENGINEER: "softwareEngineer",
  CYBER_SECURITY: "cyberSecurityAnalyst",
  PRODUCT_MANAGER: "productManager",
};
export const awarenessQuestion = {
  id: "awareness",
  phase: 1,
  question: "Do you already have a career focus area in mind?",
  options: [
    { label: "Yes, I know what I want to pursue", value: "known" },
    { label: "I have some ideas but I'm not certain", value: "partial" },
    { label: "No idea yet", value: "unknown" },
  ],
};
export const discoveryQuestions = [
  {
    id: "workStyle",
    phase: 2,
    question: "Which of these describes how you like to spend your time?",
    options: [
      { label: "Making things look and feel intuitive for people",   scores: { uxDesigner: 3 } },
      { label: "Finding patterns and meaning in numbers or datasets", scores: { dataAnalyst: 3 } },
      { label: "Building systems and solving technical puzzles",      scores: { softwareEngineer: 2, cyberSecurityAnalyst: 1 } },
      { label: "Organizing people, projects, and priorities",        scores: { productManager: 3 } },
      { label: "Researching how technology affects society",         scores: { cyberSecurityAnalyst: 2, dataAnalyst: 1 } },
    ],
  },
  {
    id: "idealDay",
    phase: 2,
    question: "When you imagine a satisfying workday, what does it look like?",
    options: [
      { label: "Sketching interfaces and running user tests",         scores: { uxDesigner: 3 } },
      { label: "Writing queries and building dashboards",             scores: { dataAnalyst: 3 } },
      { label: "Coding features and reviewing pull requests",         scores: { softwareEngineer: 3 } },
      { label: "Running standups, writing specs, unblocking teammates", scores: { productManager: 3 } },
      { label: "Auditing systems and identifying security risks",     scores: { cyberSecurityAnalyst: 3 } },
    ],
  },
  {
    id: "codingComfort",
    phase: 2,
    question: "How comfortable are you with writing code as a core part of your job?",
    options: [
      { label: "I want coding to be my main skill",              scores: { softwareEngineer: 3, cyberSecurityAnalyst: 1 } },
      { label: "I'm okay with scripting or light coding",        scores: { dataAnalyst: 2, cyberSecurityAnalyst: 2 } },
      { label: "I prefer tools over writing code from scratch",  scores: { uxDesigner: 2, dataAnalyst: 1 } },
      { label: "I'd rather work with people and strategy",       scores: { productManager: 3, uxDesigner: 1 } },
    ],
  },
];
export const careerSpecificQuestions = [
  {
    id: "excitingProblem",
    phase: 3,
    question: "What kind of problem excites you most in this area?",
    optionsByCareer: {
      uxDesigner:          "Reducing friction in a confusing checkout flow",
      dataAnalyst:         "Predicting churn before users leave",
      softwareEngineer:    "Scaling a system to handle 10× more traffic",
      cyberSecurityAnalyst:"Finding a vulnerability before an attacker does",
      productManager:      "Deciding which feature to build next — and why",
    },
  },
  {
    id: "skillToGrow",
    phase: 3,
    question: "Which skill would you most like to develop in the next year?",
    optionsByCareer: {
      uxDesigner:          "Figma prototyping and accessibility auditing",
      dataAnalyst:         "SQL, Python, and data storytelling",
      softwareEngineer:    "System design and distributed architecture",
      cyberSecurityAnalyst:"Threat modeling and penetration testing",
      productManager:      "Roadmapping, stakeholder alignment, and product metrics",
    },
  },
  {
    id: "meaningfulOutcome",
    phase: 3,
    question: "Which real-world outcome feels most meaningful to you?",
    optionsByCareer: {
      uxDesigner:          "An app so easy to use that anyone can navigate it",
      dataAnalyst:         "A report that changes how a company makes decisions",
      softwareEngineer:    "A feature shipped to millions of users",
      cyberSecurityAnalyst:"A breach that never happened because you caught it first",
      productManager:      "A roadmap that aligns a whole team around a clear goal",
    },
  },
];
export const auditQuestion = {
  id: "audit",
  phase: 4,
  question:
    "Would you like to upload your degree audit so we can tailor course recommendations to what you haven't taken yet?",
  options: [
    { label: "Yes, I'll upload my audit", value: "upload" },
    { label: "No thanks, show all recommendations", value: "skip" },
  ],
};
export const getConfirmationQuestion = (careerTitle) => ({
  id: "confirmation",
  phase: 5,
  question: `Based on your answers, we think ${careerTitle} could be a great fit. Does this feel right?`,
  options: [
    { label: "Yes, show me the roadmap and courses", value: "confirm" },
    { label: "I want to choose my focus manually",   value: "manual" },
    { label: "No, let me retake the quiz",           value: "restart" },
  ],
});
export function getQuizSequence(awarenessAnswer, resolvedCareer) {
  const seq = [awarenessQuestion];

  if (awarenessAnswer === "known") {
    if (resolvedCareer) {
      seq.push(...buildCareerSpecificQuestions(resolvedCareer));
      seq.push(auditQuestion);
      seq.push(getConfirmationQuestion(careerKeyToTitle(resolvedCareer)));
    }
  } else if (awarenessAnswer === "partial" || awarenessAnswer === "unknown") {
    seq.push(...discoveryQuestions);
    if (resolvedCareer) {
      seq.push(...buildCareerSpecificQuestions(resolvedCareer));
      seq.push(auditQuestion);
      seq.push(getConfirmationQuestion(careerKeyToTitle(resolvedCareer)));
    }
  }

  return seq;
}
export const manualPickQuestion = {
  id: "manualPick",
  phase: 1,
  question: "Which career focus area do you want to explore?",
  options: [
    { label: "UX / UI Designer",        value: CAREERS.UX_DESIGNER },
    { label: "Data Analyst",            value: CAREERS.DATA_ANALYST },
    { label: "Software Engineer",       value: CAREERS.SOFTWARE_ENGINEER },
    { label: "Cyber Security Analyst",  value: CAREERS.CYBER_SECURITY },
    { label: "Product Manager",         value: CAREERS.PRODUCT_MANAGER },
  ],
};
function buildCareerSpecificQuestions(topCareer) {
  const careerOrder = [
    topCareer,
    ...Object.values(CAREERS).filter((c) => c !== topCareer),
  ];

  return careerSpecificQuestions.map((q) => ({
    ...q,
    options: careerOrder.map((careerKey) => ({
      label: q.optionsByCareer[careerKey],
      scores: { [careerKey]: 2 },
    })),
  }));
}
export function scoreAnswers(sequence, answers) {
  const scores = {
    dataAnalyst: 0,
    uxDesigner: 0,
    softwareEngineer: 0,
    cyberSecurityAnalyst: 0,
    productManager: 0,
  };

  sequence.forEach((q) => {
    const selectedIndex = answers[q.id];
    if (selectedIndex == null) return;
    const option = q.options?.[selectedIndex];
    if (!option?.scores) return;
    Object.entries(option.scores).forEach(([career, pts]) => {
      if (career in scores) scores[career] += pts;
    });
  });

  const topCareers = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => key);

  return { topCareers, scores };
}
export function resolveCareerFromDiscovery(discoveryAnswers) {
  const scores = {
    dataAnalyst: 0,
    uxDesigner: 0,
    softwareEngineer: 0,
    cyberSecurityAnalyst: 0,
    productManager: 0,
  };

  discoveryQuestions.forEach((q, i) => {
    const selectedIndex = discoveryAnswers[i];
    if (selectedIndex == null) return;
    const option = q.options[selectedIndex];
    if (!option?.scores) return;
    Object.entries(option.scores).forEach(([career, pts]) => {
      if (career in scores) scores[career] += pts;
    });
  });

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}
export function careerKeyToTitle(key) {
  const map = {
    dataAnalyst:          "Data Analyst",
    uxDesigner:           "UX / UI Designer",
    softwareEngineer:     "Software Engineer",
    cyberSecurityAnalyst: "Cyber Security Analyst",
    productManager:       "Product Manager",
  };
  return map[key] ?? key;
}