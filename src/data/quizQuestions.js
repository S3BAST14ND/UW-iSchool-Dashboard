
export const quizQuestions = [
  {
    id: "concentration",
    type: "single",
    question: "What is your Informatics concentration?",
    askedWhen: null,
    options: [
      {
        id: "data_science",
        text: "Data Science",
        scores: {
          dataAnalysis: 3,
          statistics: 2,
          sql: 1,
          dataVisualization: 1,
        },
      },
      {
        id: "hci",
        text: "Human-Computer Interaction",
        scores: {
          userEmpathy: 3,
          researchMethods: 2,
          visualDesign: 1,
          productThinking: 1,
        },
      },
      {
        id: "cybersecurity",
        text: "Cybersecurity",
        scores: {
          cybersecurity: 3,
          systemsThinking: 2,
          technicalLiteracy: 1,
        },
      },
      {
        id: "other",
        text: "Other / Not sure yet",
        scores: {
          problemSolving: 1,
          communication: 1,
          technicalLiteracy: 1,
        },
      },
    ],
  },

  {
    id: "has_career_in_mind",
    type: "single",
    question: "Do you already have a career path in mind?",
    askedWhen: null,
    options: [
      {
        id: "yes",
        text: "Yes, I have a specific role or direction in mind",
        scores: {},
      },
      {
        id: "partial",
        text: "Kind of — I have a few ideas, but I am not sure",
        scores: {},
      },
      {
        id: "no",
        text: "No, I want help exploring options",
        scores: {},
      },
    ],
  },

  {
    id: "career_goal_picker",
    type: "career-picker",
    question: "Which career are you aiming for?",
    askedWhen: {
      questionId: "has_career_in_mind",
      optionIds: ["yes"],
    },
    scores: {},
  },

  {
    id: "explore_similar_options",
    type: "single",
    question: "Would you like to explore similar career options before choosing?",
    askedWhen: {
      questionId: "has_career_in_mind",
      optionIds: ["yes"],
    },
    options: [
      {
        id: "yes",
        text: "Yes, show me similar options",
        scores: {},
      },
      {
        id: "no",
        text: "No, use the career I selected",
        scores: {},
      },
    ],
  },

  {
    id: "known_direction",
    type: "single",
    question: "Which direction are you most interested in right now?",
    askedWhen: {
      anyOf: [
        {
          questionId: "has_career_in_mind",
          optionIds: ["partial", "no"],
        },
        {
          questionId: "explore_similar_options",
          optionIds: ["yes"],
        },
      ],
    },
    options: [
      {
        id: "data",
        text: "Data, analytics, dashboards, or databases",
        scores: {
          dataAnalysis: 3,
          sql: 2,
          dataVisualization: 2,
          statistics: 1,
        },
      },
      {
        id: "ux",
        text: "UX, design, research, or human-centered technology",
        scores: {
          userEmpathy: 3,
          researchMethods: 2,
          visualDesign: 2,
          communication: 1,
        },
      },
      {
        id: "software",
        text: "Software development, web apps, or technical systems",
        scores: {
          programming: 3,
          systemsThinking: 2,
          problemSolving: 2,
          technicalLiteracy: 2,
        },
      },
      {
        id: "security",
        text: "Cybersecurity, privacy, risk, or cloud security",
        scores: {
          cybersecurity: 3,
          systemsThinking: 2,
          cloudPlatforms: 1,
          problemSolving: 2,
        },
      },
      {
        id: "product_business",
        text: "Product, consulting, project management, or business technology",
        scores: {
          productThinking: 3,
          businessThinking: 3,
          communication: 2,
          teamwork: 2,
        },
      },
    ],
  },

  {
    id: "work_style",
    type: "single",
    question: "Which of these describes how you like to spend your time?",
    askedWhen: {
      questionId: "has_career_in_mind",
      optionIds: ["partial", "no"],
    },
    options: [
      {
        id: "design_people",
        text: "Making technology easier and more intuitive for people",
        scores: {
          userEmpathy: 3,
          visualDesign: 2,
          communication: 1,
        },
      },
      {
        id: "data_patterns",
        text: "Finding patterns and meaning in numbers or datasets",
        scores: {
          dataAnalysis: 3,
          statistics: 2,
          problemSolving: 1,
        },
      },
      {
        id: "technical_building",
        text: "Building systems and solving technical puzzles",
        scores: {
          programming: 3,
          systemsThinking: 2,
          problemSolving: 2,
        },
      },
      {
        id: "organizing_people",
        text: "Organizing people, projects, priorities, and decisions",
        scores: {
          productThinking: 2,
          projectManagement: 3,
          teamwork: 2,
          communication: 2,
        },
      },
      {
        id: "risk_security",
        text: "Understanding risks, privacy, and how systems can fail",
        scores: {
          cybersecurity: 3,
          systemsThinking: 2,
          problemSolving: 2,
        },
      },
    ],
  },

  {
    id: "ideal_day",
    type: "single",
    question: "When you imagine a satisfying workday, what does it look like?",
    askedWhen: {
      questionId: "has_career_in_mind",
      optionIds: ["partial", "no"],
    },
    options: [
      {
        id: "interviews_tests",
        text: "Interviewing users, running usability tests, and summarizing findings",
        scores: {
          researchMethods: 3,
          userEmpathy: 3,
          communication: 2,
        },
      },
      {
        id: "queries_dashboards",
        text: "Writing queries, cleaning data, and building dashboards",
        scores: {
          sql: 3,
          dataAnalysis: 3,
          dataVisualization: 2,
        },
      },
      {
        id: "coding_features",
        text: "Coding features, debugging, and reviewing technical work",
        scores: {
          programming: 3,
          technicalLiteracy: 2,
          problemSolving: 2,
        },
      },
      {
        id: "planning_team",
        text: "Running meetings, writing specs, and unblocking teammates",
        scores: {
          productThinking: 3,
          projectManagement: 3,
          communication: 2,
          teamwork: 2,
        },
      },
      {
        id: "security_review",
        text: "Auditing systems and identifying security risks",
        scores: {
          cybersecurity: 3,
          systemsThinking: 2,
          cloudPlatforms: 1,
        },
      },
    ],
  },

  {
    id: "coding_comfort",
    type: "single",
    question: "How comfortable are you with writing code as a major part of your work?",
    askedWhen: {
      questionId: "has_career_in_mind",
      optionIds: ["partial", "no"],
    },
    options: [
      {
        id: "main_skill",
        text: "I want coding to be one of my main skills",
        scores: {
          programming: 3,
          technicalLiteracy: 2,
          systemsThinking: 1,
        },
      },
      {
        id: "some_scripting",
        text: "I am okay with scripting, SQL, or light coding",
        scores: {
          sql: 2,
          dataAnalysis: 2,
          technicalLiteracy: 1,
        },
      },
      {
        id: "tools_over_code",
        text: "I prefer using tools over writing code from scratch",
        scores: {
          dataVisualization: 2,
          visualDesign: 2,
          communication: 1,
        },
      },
      {
        id: "people_strategy",
        text: "I would rather focus on people, strategy, and coordination",
        scores: {
          communication: 3,
          productThinking: 2,
          businessThinking: 2,
          teamwork: 2,
        },
      },
    ],
  },

  {
    id: "problem_appeal",
    type: "single",
    question: "Which challenge sounds most appealing?",
    askedWhen: {
      questionId: "has_career_in_mind",
      optionIds: ["partial", "no"],
    },
    options: [
      {
        id: "confusing_interface",
        text: "Redesigning a confusing interface",
        scores: {
          userEmpathy: 3,
          visualDesign: 2,
          productThinking: 1,
        },
      },
      {
        id: "large_dataset",
        text: "Finding patterns in a large dataset",
        scores: {
          dataAnalysis: 3,
          statistics: 2,
          sql: 1,
        },
      },
      {
        id: "complex_code",
        text: "Debugging complex code",
        scores: {
          programming: 3,
          problemSolving: 3,
          systemsThinking: 2,
        },
      },
      {
        id: "privacy_risk",
        text: "Evaluating a privacy or security risk",
        scores: {
          cybersecurity: 3,
          systemsThinking: 2,
          technicalLiteracy: 1,
        },
      },
      {
        id: "stakeholder_project",
        text: "Coordinating a multi-stakeholder project",
        scores: {
          communication: 3,
          projectManagement: 3,
          businessThinking: 2,
        },
      },
    ],
  },

  {
    id: "data_tiebreaker",
    type: "single",
    question: "For data work, which sounds most interesting?",
    askedWhen: {
      anyTopFocusIn: ["data"],
    },
    options: [
      {
        id: "dashboards",
        text: "Dashboards, reports, and business insights",
        scores: {
          dataVisualization: 3,
          businessThinking: 2,
          communication: 1,
        },
      },
      {
        id: "databases",
        text: "SQL, database structure, and data systems",
        scores: {
          sql: 3,
          databases: 3,
          systemsThinking: 2,
        },
      },
      {
        id: "analysis",
        text: "Statistical analysis and finding patterns",
        scores: {
          statistics: 3,
          dataAnalysis: 3,
          problemSolving: 1,
        },
      },
      {
        id: "pipelines",
        text: "Data pipelines, automation, and backend data work",
        scores: {
          programming: 2,
          databases: 2,
          systemsThinking: 3,
          cloudPlatforms: 1,
        },
      },
    ],
  },

  {
    id: "ux_tiebreaker",
    type: "single",
    question: "For UX or human-centered work, which sounds more appealing?",
    askedWhen: {
      anyTopFocusIn: ["ux"],
    },
    options: [
      {
        id: "research",
        text: "Researching users and explaining findings",
        scores: {
          researchMethods: 3,
          userEmpathy: 3,
          communication: 2,
        },
      },
      {
        id: "design",
        text: "Designing screens, prototypes, and flows",
        scores: {
          visualDesign: 3,
          userEmpathy: 2,
          productThinking: 1,
        },
      },
      {
        id: "information_structure",
        text: "Organizing content, navigation, and information structures",
        scores: {
          informationArchitecture: 3,
          userEmpathy: 2,
          systemsThinking: 1,
        },
      },
    ],
  },

  {
    id: "software_tiebreaker",
    type: "single",
    question: "For software work, which direction sounds best?",
    askedWhen: {
      anyTopFocusIn: ["software"],
    },
    options: [
      {
        id: "frontend",
        text: "Frontend interfaces and interactive web apps",
        scores: {
          programming: 2,
          visualDesign: 2,
          userEmpathy: 1,
          technicalLiteracy: 2,
        },
      },
      {
        id: "backend",
        text: "Backend systems, APIs, and databases",
        scores: {
          programming: 3,
          systemsThinking: 3,
          databases: 2,
        },
      },
      {
        id: "general_software",
        text: "General software engineering and technical problem solving",
        scores: {
          programming: 3,
          problemSolving: 3,
          systemsThinking: 2,
        },
      },
    ],
  },

  {
    id: "security_tiebreaker",
    type: "single",
    question: "For security work, which sounds most interesting?",
    askedWhen: {
      anyTopFocusIn: ["security"],
    },
    options: [
      {
        id: "cloud_security",
        text: "Cloud platforms, access control, and secure infrastructure",
        scores: {
          cloudPlatforms: 3,
          cybersecurity: 3,
          systemsThinking: 2,
        },
      },
      {
        id: "security_analysis",
        text: "Monitoring threats, investigating incidents, and reducing risk",
        scores: {
          cybersecurity: 3,
          problemSolving: 2,
          technicalLiteracy: 2,
        },
      },
      {
        id: "policy_risk",
        text: "Security strategy, policies, and organizational risk",
        scores: {
          cybersecurity: 2,
          businessThinking: 2,
          communication: 2,
        },
      },
    ],
  },

  {
    id: "product_business_tiebreaker",
    type: "single",
    question: "For product or business technology work, which sounds best?",
    askedWhen: {
      anyTopFocusIn: ["product", "business"],
    },
    options: [
      {
        id: "product",
        text: "Deciding what product features to build and why",
        scores: {
          productThinking: 3,
          userEmpathy: 2,
          businessThinking: 2,
        },
      },
      {
        id: "consulting",
        text: "Helping organizations solve business problems with technology",
        scores: {
          businessThinking: 3,
          communication: 3,
          systemsThinking: 2,
        },
      },
      {
        id: "program_project",
        text: "Managing timelines, risks, dependencies, and team execution",
        scores: {
          projectManagement: 3,
          teamwork: 3,
          communication: 2,
        },
      },
    ],
  },

  {
    id: "final_career_selection",
    type: "career-results-picker",
    question: "Choose the career you want to pursue",
    askedWhen: {
      questionId: "has_career_in_mind",
      optionIds: ["partial", "no"],
    },
  }
];