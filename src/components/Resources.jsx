import { useState } from "react";
 
const categories = [
  {
    id: "jobs",
    icon: "🔎",
    title: "Job & Internship Resources",
    desc: "Find job and internship opportunities curated for Informatics students, along with tools to strengthen your application materials.",
    links: [
      {
        label: "Job & Internship Resources",
        url: "https://ischool.uw.edu/advising-support/career-services/jobs",
      },
      {
        label: "Job Documents (Resumes, Cover Letters, LinkedIn)",
        url: "https://ischool.uw.edu/advising-support/career-services/jobs/documents",
      },
      {
        label: "Interview Prep",
        url: "https://ischool.uw.edu/advising-support/career-services/jobs/interviews",
      },
    ],
  },
  {
    id: "advising",
    icon: "🏫",
    title: "Appointments & Advising",
    desc: "Meet with an iSchool career advisor for personalized guidance, and use Handshake to browse UW-specific job and internship postings.",
    links: [
      {
        label: "Appointments & Advising",
        url: "https://ischool.uw.edu/advising-support/career-services/appointments-advising",
      },
      {
        label: "Handshake — UW Jobs Portal",
        url: "https://uw.joinhandshake.com/explore",
      },
    ],
  },
  {
    id: "events",
    icon: "🎓",
    title: "iSchool Career Events",
    desc: "Stay connected with recruiting events, networking nights, and career fairs designed to help Informatics students meet employers.",
    links: [
      {
        label: "iSchool Career Events",
        url: "https://ischool.uw.edu/advising-support/career-services/events",
      },
      {
        label: "Events Calendar",
        url: "https://ischool.uw.edu/events",
      },
      {
        label: "iSchool Career Fair",
        url: "https://ischool.uw.edu/advising-support/career-services/events/career-fair",
      },
    ],
  },
  {
    id: "groups",
    icon: "🤝",
    title: "Student Groups",
    desc: "Join iSchool student organizations like WINFO, SODA, and others to build your network and access exclusive opportunities.",
    links: [
      {
        label: "iSchool Student Groups",
        url: "https://ischool.uw.edu/student-groups",
      },
    ],
  },
];
 
const filters = [
  { label: "All Resources", value: "all" },
  { label: "Jobs & Internships", value: "jobs" },
  { label: "Appointments & Advising", value: "advising" },
  { label: "Career Events", value: "events" },
  { label: "Student Groups", value: "groups" },
];
 
export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = useState("all");
 
  const visible = categories.filter(
    (c) => activeFilter === "all" || c.id === activeFilter
  );
 
  return (
    <div className="resources-page">
      <div className="alumni-header">
        <div className="header-content">
          <h1 className="page-title">
            Your Career <em className="hero-em">Toolkit</em>
          </h1>
          <p className="page-subtitle">
            Everything you need to land your dream role — from polishing your
            resume to navigating UW's iSchool community.
          </p>
        </div>
      </div>
      <div className="resource-filter-bar">
        <span className="resource-filter-label">Filter by</span>
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`resource-filter-btn${activeFilter === f.value ? " active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="resource-grid">
        {visible.map((c) => (
          <div key={c.id} className="resource-card">
            <div className="resource-card-icon">{c.icon}</div>
            <h3 className="resource-card-title">{c.title}</h3>
            <p className="resource-card-desc">{c.desc}</p>
            <ul className="resource-link-list">
              {c.links.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-link"
                  >
                    {l.label} →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}