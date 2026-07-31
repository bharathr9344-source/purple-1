import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/auth";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [createdId, setCreatedId] = useState(null);

  if (user && !createdId) return <Navigate to="/profile" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const res = register(username, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCreatedId(res.userId);
  };

  if (createdId) {
    return (
      <main className="page auth-page">
        <div className="auth-card card">
          <p className="eyebrow">WELCOME TO THE PACK</p>
          <h2 className="section-title">Account created 🐺</h2>
          <p className="muted">
            Your unique hunter ID has been issued. Keep it safe — it identifies
            your Cyber Wolf Chain profile.
          </p>

          <div className="user-id-box">
            <span>UNIQUE USER ID</span>
            <strong>{createdId}</strong>
          </div>

          <div className="done-actions">
            <button className="btn" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </button>
            <Link to="/profile" className="btn secondary">
              View Profile
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page auth-page">
      <div className="auth-card card">
        <p className="eyebrow">JOIN CYBER WOLF CHAIN</p>
        <h2 className="section-title">Create your hunter account</h2>
        <p className="muted">
          One account tracks your streak, skills, badges and solved rooms.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              className="sim-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. wolfhunter_99"
              autoComplete="username"
              autoFocus
            />
          </label>
          <label>
            Password
            <input
              className="sim-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 4 characters"
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirm Password
            <input
              className="sim-field"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
          </label>

          {error ? <p className="feedback err">{error}</p> : null}

          <button className="btn auth-submit" type="submit">
            Register
          </button>
        </form>

        <p className="muted auth-switch">
          Already hunting? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
