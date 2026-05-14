import { useState } from "react";
import "../index.css";

const featuredAlumni = {
  name: "Maya Alvarez",
  pronouns: "She/Her",
  graduationYear: "Informatics, Class of 2021",
  currentRole: "Product Data Analyst",
  company: "Civic Technology Lab",
  email: "maya.alvarez@example.com",
  image: `${import.meta.env.BASE_URL}alumni-placeholder.png`,
  focus: "Data Science and Human-Computer Interaction",
  location: "Seattle, WA",

  blurb:
    "I now work as a Product Data Analyst, where I help teams understand how people use digital public-service tools. My work combines data analysis, user research, and product thinking to improve services that affect real communities.",

  skills: [
    "SQL and database querying",
    "Data visualization",
    "User research synthesis",
    "Product analytics",
    "Communicating technical findings",
  ],

  helpfulCourses: [
    "INFO 330: Databases and Data Modeling",
    "INFO 340: Client-Side Development",
    "INFO 360: Design Thinking",
    "INFO 370: Data Science Methods",
    "INFO 474: Interactive Information Visualization",
  ],
};

const students = [
  {
    name: "Alex",
    avatar: "🧗",
    hobby: "hiking",
    intro:
      "Hello, my name is Alex, and I enjoy hiking. Feel free to message me about tips and advice etc!",
    major: "Informatics",
    degree: "Bachelors of Science in Informatics",
    courses: "INFO 340, INFO 370",
    career: "Entrepreneur",
  },
  {
    name: "Jessie",
    avatar: "💃",
    hobby: "dancing",
    intro:
      "Hello, my name is Jessie, and I enjoy dancing. Feel free to message me about tips and advice etc!",
    major: "Informatics",
    degree: "Bachelors of Science in Informatics",
    courses: "INFO 200, INFO 330",
    career: "Data Analyst",
  },
  {
    name: "Breu",
    avatar: "🧶",
    hobby: "knitting",
    intro:
      "Hello, my name is Breu, and I enjoy knitting. Feel free to message me about tips and advice etc!",
    major: "Informatics",
    degree: "Bachelors of Science in Informatics",
    courses: "INFO 201, INFO 360",
    career: "Product Manager",
  },
  {
    name: "Sunshine",
    avatar: "🛹",
    hobby: "skateboarding",
    intro:
      "Hello, my name is Sunshine, and I enjoy skateboarding. Feel free to message me about tips and advice etc!",
    major: "Informatics",
    degree: "Bachelors of Science in Informatics",
    courses: "INFO 200, INFO 330",
    career: "Data Analyst",
  },
  {
    name: "Victor",
    avatar: "🧗",
    hobby: "climbing",
    intro:
      "Hello, my name is Victor, and I enjoy climbing. Feel free to message me about tips and advice etc!",
    major: "Informatics",
    degree: "Bachelors of Science in Informatics",
    courses: "INFO 200, INFO 455",
    career: "Cyber Security Engineer",
  },
  {
    name: "Rose",
    avatar: "✈️",
    hobby: "traveling",
    intro:
      "Hello, my name is Rose, and I enjoy traveling. Feel free to message me about tips and advice etc!",
    major: "Informatics",
    degree: "Bachelors of Science in Informatics",
    courses: "INFO 340, INFO 492",
    career: "Software Developer",
  },
];

const StudentCard = ({ student }) => {
  const [isSaved, setIsSaved] = useState(false);

  const avatarColors = {
    "🧗": "avatar-green",
    "💃": "avatar-orange",
    "🧶": "avatar-brown",
    "🛹": "avatar-yellow",
    "✈️": "avatar-lime",
  };

  return (
    <div className="student-card-modern">
      <div className="card-header-modern">
        <div
          className={`avatar-modern ${
            avatarColors[student.avatar] || "avatar-green"
          }`}
        >
          {student.avatar}
        </div>

        <div className="student-info-header">
          <h3 className="student-name">{student.name}</h3>
          <p className="student-career">{student.career}</p>
        </div>

        <button
          className={`bookmark-btn ${isSaved ? "saved" : ""}`}
          onClick={() => setIsSaved(!isSaved)}
          aria-label={isSaved ? "Unsave alumni" : "Save alumni"}
        >
          {isSaved ? "★" : "☆"}
        </button>
      </div>

      <div className="card-body-modern">
        <p className="intro-modern">"{student.intro}"</p>

        <div className="info-grid-modern">
          <div className="info-item-modern">
            <span className="info-icon">🎓</span>
            <div>
              <p className="info-title">Major</p>
              <p className="info-content">{student.major}</p>
            </div>
          </div>

          <div className="info-item-modern">
            <span className="info-icon">📚</span>
            <div>
              <p className="info-title">Courses</p>
              <p className="info-content">{student.courses}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-footer-modern">
        <button className="message-btn-modern">
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Send Message
        </button>

        <button className="profile-btn-modern">View Profile</button>
      </div>
    </div>
  );
};

export default function Spotlight() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = students.filter((student) => {
    const q = searchQuery.toLowerCase().trim();

    if (!q) return true;

    return (
      student.name.toLowerCase().includes(q) ||
      student.hobby.toLowerCase().includes(q) ||
      student.major.toLowerCase().includes(q) ||
      student.degree.toLowerCase().includes(q) ||
      student.courses.toLowerCase().includes(q) ||
      student.career.toLowerCase().includes(q) ||
      student.intro.toLowerCase().includes(q)
    );
  });

  return (
    <div className="alumni-page">
      <div className="alumni-header">
        <div className="header-content">
          <h1 className="page-title">Alumni Spotlight</h1>
          <p className="page-subtitle">
            Connect with iSchool graduates and learn from their journeys.
          </p>
        </div>
      </div>

      <main className="spotlight-body">
        <section className="spotlight-feature-card">
          <div className="spotlight-image-wrap">
            <img
              src={featuredAlumni.image}
              alt={`${featuredAlumni.name} alumni placeholder`}
              className="spotlight-image"
            />
          </div>

          <div className="spotlight-feature-content">
            <p className="spotlight-kicker">Featured Alumni</p>

            <h2>{featuredAlumni.name}</h2>

            <p className="spotlight-role">
              {featuredAlumni.currentRole} at {featuredAlumni.company}
            </p>

            <p className="spotlight-meta">
              {featuredAlumni.graduationYear} • {featuredAlumni.location}
            </p>

            <p className="spotlight-blurb">{featuredAlumni.blurb}</p>

            <div className="spotlight-pill-row">
              <span className="spotlight-pill">
                Focus: {featuredAlumni.focus}
              </span>
              <span className="spotlight-pill">Product + Data</span>
              <span className="spotlight-pill">Public Interest Tech</span>
            </div>

            <div className="spotlight-actions">
              <a
                className="btn btn-primary"
                href={`mailto:${featuredAlumni.email}?subject=Question from iSchool Career Dashboard`}
              >
                Reach out by email
              </a>
            </div>
          </div>
        </section>

        <section className="spotlight-grid">
          <article className="spotlight-card spotlight-card-large">
            <p className="dash-section-label">My Path</p>

            <h3>From Informatics to product analytics</h3>

            <p>
              During my time in Informatics, I focused on the overlap between
              data, people, and decision-making. I was interested in how
              organizations use data to improve products, but I also wanted to
              stay connected to user needs instead of only working with numbers.
            </p>

            <p>
              After graduating, I started in a junior data role where I built
              dashboards, cleaned product usage data, and helped teams answer
              questions about user behavior. Over time, my role became more
              strategic. I now partner with designers, engineers, and product
              managers to decide what to measure, how to interpret results, and
              what changes are worth making.
            </p>

            <p>
              Informatics helped me because it gave me both a technical
              foundation and a human-centered way to think about technology. The
              ability to move between data, design, and communication became one
              of my biggest strengths.
            </p>
          </article>

          <article className="spotlight-card">
            <p className="dash-section-label">Current Work</p>

            <h3>What I do now</h3>

            <p>
              I analyze product data to understand where users get stuck, which
              features are working, and how digital services can be made easier
              to use.
            </p>

            <p>
              My day-to-day work includes writing SQL queries, building
              dashboards, reviewing experiment results, and explaining findings
              to non-technical teammates.
            </p>
          </article>

          <article className="spotlight-card">
            <p className="dash-section-label">iSchool Focus</p>

            <h3>What I focused on</h3>

            <p>
              My main focus was data science with a strong interest in
              human-computer interaction. I chose projects that connected data
              analysis with user needs, especially when the outcome could improve
              a real service or workflow.
            </p>
          </article>

          <article className="spotlight-card">
            <p className="dash-section-label">Useful Skills</p>

            <h3>Skills that helped me</h3>

            <ul className="spotlight-list">
              {featuredAlumni.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </article>

          <article className="spotlight-card">
            <p className="dash-section-label">Helpful Courses</p>

            <h3>Courses that connected</h3>

            <ul className="spotlight-list">
              {featuredAlumni.helpfulCourses.map((course) => (
                <li key={course}>{course}</li>
              ))}
            </ul>
          </article>

          <article className="spotlight-card spotlight-card-large">
            <p className="dash-section-label">Advice for Students</p>

            <h3>What I recommend</h3>

            <p>
              I recommend building projects that show both the technical process
              and the reasoning behind it. For data-focused roles, it is not
              enough to show a chart or dashboard. You should explain the
              question you started with, why the data mattered, what choices you
              made, and what someone could do with the result.
            </p>

            <p>
              I also recommend practicing communication early. Many of my most
              important contributions at work come from translating technical
              findings into clear next steps for designers, engineers, and
              product managers.
            </p>
          </article>
        </section>

        <section className="alumni-directory-section">
          <div className="alumni-directory-header">
            <p className="dash-section-label">More Alumni</p>

            <h2>Connect with other iSchool graduates</h2>

            <p>
              These placeholder profiles can later be replaced with real alumni
              stories, contact options, and career details.
            </p>
          </div>

          <div className="search-container-modern">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="search-icon-modern"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>

            <input
              type="text"
              placeholder="Search by skills, expertise, courses, major..."
              className="search-input-modern"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <button className="filter-btn-modern">
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Filters
            </button>
          </div>

          <div className="cards-grid-modern">
            {filteredStudents.map((student, i) => (
              <StudentCard key={`${student.name}-${i}`} student={student} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
