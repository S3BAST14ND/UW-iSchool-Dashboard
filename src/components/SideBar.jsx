import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";


export default function Sidebar() {

  const navigate = useNavigate();

  async function handleLogout(e) {
    e.preventDefault();
    await logout();
    navigate("/");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img
          src={`${import.meta.env.BASE_URL}ischool-logo.png`}
          alt="Information School, University of Washington"
          className="sidebar-logo-image"
        />
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link">
          <span className="material-symbols-rounded nav-icon">home</span>
          <span>Home</span>
        </NavLink>

        <NavLink to="/profile" className="sidebar-link">
          <span className="material-symbols-rounded nav-icon">person</span>
          <span>Profile</span>
        </NavLink>

        <NavLink to="/quiz" className="sidebar-link">
          <span className="material-symbols-rounded nav-icon">quiz</span>
          <span>Quiz</span>
        </NavLink>

        <NavLink to="/parse?mode=reupload" className="sidebar-link">
          <span className="material-symbols-rounded nav-icon">fact_check</span>
          <span>Audit</span>
        </NavLink>

        <NavLink to="/alumni" className="sidebar-link">
          <span className="material-symbols-rounded nav-icon">groups</span>
          <span>Spotlight</span>
        </NavLink>

        <NavLink to="/resources" className="sidebar-link">
          <span className="material-symbols-rounded nav-icon">menu_book</span>
          <span>Resources</span>
        </NavLink>

        <NavLink to="/advising" className="sidebar-link">
          <span className="material-symbols-rounded nav-icon">support_agent</span>
          <span>Advising</span>
        </NavLink>
      </nav>
      <div className="sidebar-logout">
        <NavLink to="/" className="sidebar-link" onClick={handleLogout}>
          <span className="material-symbols-rounded nav-icon">logout</span>
          <span>Log Out</span>
        </NavLink>
      </div>
    </aside>
  );
}
