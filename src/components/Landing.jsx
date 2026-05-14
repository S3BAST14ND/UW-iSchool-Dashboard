import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInUw, signUpUw, updateCurrentUserProfile } from "../utils/localStore";

export default function Landing({ onLogin }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Routes both login modes through the local demo account store.
  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      let user;

      if (mode === "signup") {
        if (!displayName.trim()) throw new Error("Please enter a display name.");

        user = await signUpUw(email, password);

        user = await updateCurrentUserProfile({
          displayName: displayName.trim(),
        });
      } else {
        user = await signInUw(email, password);
      }

      onLogin?.(user);
      navigate("/dashboard");
    } catch (e) {
      setErr(e?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing-container">
      <div className="landing-left">
        <img
          src={`${import.meta.env.BASE_URL}hero.jpg`}
          alt="Students collaborating"
          className="landing-image"
        />
      </div>

      <div className="landing-right">
        <div className="login-card">
          <h1 className="login-title">
            {mode === "login" ? "Sign In to the " : "Create an account for the "}
            <span>iSchool Career Dashboard</span>
          </h1>

          <div className="open-source-notice" role="note">
            <strong>Open-source transition notice:</strong> This capstone project
            will transition to open source on June 1, 2026. Previously collected
            research data was scheduled for deletion by May 30, 2026. This demo
            stores new activity only in your browser's local storage.
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <label>
                Display Name
                <input
                  type="text"
                  placeholder="How you want to appear"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </label>
            )}

            <label>
              UW Email
              <input
                type="email"
                placeholder="netid@uw.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="Enter password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </label>

            {err && <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>}

            <button type="submit" className="sign-in-button" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>

            <div className="login-actions" style={{ marginTop: 10, textAlign: "center" }}>
              <button
                type="button"
                onClick={() => {
                  setErr("");
                  setMode(mode === "login" ? "signup" : "login");
                }}
                disabled={loading}
                style={{ background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
