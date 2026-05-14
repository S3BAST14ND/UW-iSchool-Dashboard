import React, { useState } from 'react';
import '../index.css';

const ChevronIcon = () => (
  <svg
    className="accordion-icon"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const accordionData = [
  {
    title: "Mental Health Counseling",
    content: (
      <>
        <h3>Support for Your Wellbeing</h3>
        <p>
          The University of Washington offers comprehensive mental health services to support students
          through their academic journey. Our counseling services provide confidential support for a
          wide range of concerns.
        </p>
        <h3>Available Services</h3>
        <ul>
          <li>Individual counseling sessions</li>
          <li>Group therapy and support groups</li>
          <li>Crisis intervention services (24/7)</li>
          <li>Wellness workshops and stress management programs</li>
          <li>Referrals to community mental health resources</li>
        </ul>
        <p><strong>Crisis Line:</strong> 206-555-0123 (Available 24/7)</p>
        <a href="#" className="resource-link">Learn more about mental health resources →</a>
      </>
    ),
  },
  {
    title: "New Students",
    content: (
      <>
        <h3>Welcome to the Information School!</h3>
        <p>
          Starting your journey at the iSchool is exciting! We've compiled essential resources to
          help you transition smoothly into university life and make the most of your educational
          experience.
        </p>
        <h3>Getting Started</h3>
        <ul>
          <li>New Student Orientation — Register for upcoming sessions</li>
          <li>Academic Planning Guide — Course selection and degree requirements</li>
          <li>Campus Tour — Explore the Information School facilities</li>
          <li>Student Organizations — Connect with peers and join clubs</li>
          <li>Technology Setup — Access your UW NetID and essential software</li>
          <li>Library Resources — Introduction to research tools and databases</li>
        </ul>
        <a href="#" className="resource-link">View the complete new student checklist →</a>
      </>
    ),
  },
  {
    title: "International Students",
    content: (
      <>
        <h3>International Student Support</h3>
        <p>
          We're committed to supporting our international student community. The International
          Student Services office provides specialized resources to help you succeed academically
          and adjust to life in the United States.
        </p>
        <h3>Key Resources</h3>
        <ul>
          <li>Visa and immigration advising (F-1, J-1 status)</li>
          <li>Employment authorization and CPT/OPT guidance</li>
          <li>Cultural adjustment programs and events</li>
          <li>English language support and conversation partners</li>
          <li>International student orientation programs</li>
          <li>Tax preparation assistance</li>
          <li>Housing and community resources</li>
        </ul>
        <p><strong>ISS Office Hours:</strong> Monday–Friday, 9:00 AM – 5:00 PM</p>
        <a href="#" className="resource-link">Visit International Student Services →</a>
      </>
    ),
  },
  {
    title: "Student Groups",
    content: (
      <>
        <h3>Get Involved in the iSchool Community</h3>
        <p>
          Student organizations provide opportunities to develop leadership skills, network with
          peers and professionals, and enhance your academic experience through extracurricular
          involvement.
        </p>
        <h3>Active Student Organizations</h3>
        <ul>
          <li><strong>Information School Student Association (ISSA)</strong> — Main student government organization</li>
          <li><strong>Women in Informatics</strong> — Supporting women in technology and information fields</li>
          <li><strong>Data Science Club</strong> — Workshops, competitions, and networking for data enthusiasts</li>
          <li><strong>UX Design Collective</strong> — User experience design projects and portfolio development</li>
          <li><strong>Cybersecurity Club</strong> — Security competitions and professional development</li>
          <li><strong>AI & Machine Learning Society</strong> — Explore cutting-edge AI technologies</li>
          <li><strong>Information Ethics Forum</strong> — Discuss technology's impact on society</li>
        </ul>
        <h3>Benefits of Joining</h3>
        <ul>
          <li>Networking opportunities with industry professionals</li>
          <li>Hands-on project experience</li>
          <li>Leadership development</li>
          <li>Resume building activities</li>
          <li>Social events and community building</li>
        </ul>
        <a href="#" className="resource-link">Browse all student organizations →</a>
      </>
    ),
  },
];

const quickLinks = [
  {
    label: "Virtual Drop In",
    href: "https://meet.google.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="2" width="20" height="14" rx="2" ry="2" />
        <path d="M16 2v14" />
        <circle cx="19" cy="9" r="2" />
      </svg>
    ),
  },
  {
    label: "Schedule an Appointment",
    href: "https://calendar.google.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Email an Advisor",
    href: "mailto:advisor@uw.edu",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

// Presents student support resources and advising actions.
const Resources = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
    <>
      <div className="alumni-header">
        <div className="header-content">
          <h1 className="page-title">Advising and Additional Resources</h1>
          <p className="page-subtitle">
            Access academic resources and connect with advisors to support your success
          </p>
        </div>
      </div>

      <div className="resources-container">
        <div className="cards-container">
          {quickLinks.map(({ label, href, icon }) => (
            <a
              key={label}
              className="card"
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noreferrer"
              aria-label={label}
            >
              <div className="card-icon">{icon}</div>
              <div className="card-title">{label}</div>
            </a>
          ))}
        </div>
        {accordionData.map((accordion, index) => {
          const isOpen = activeAccordion === index;
          return (
            <div key={index} className="accordion-section">
              <button
                className={`accordion-header${isOpen ? " active" : ""}`}
                onClick={() => toggleAccordion(index)}
                aria-expanded={isOpen}
              >
                <span>{accordion.title}</span>
                <ChevronIcon />
              </button>
              <div className={`accordion-content${isOpen ? " active" : ""}`}>
                {accordion.content}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Resources;
