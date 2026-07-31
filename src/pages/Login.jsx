import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/auth";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  if (user) return <Navigate to="/profile" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const res = login(username, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <main className="page auth-page">
      <div className="auth-card card">
        <p className="eyebrow">WELCOME BACK</p>
        <h2 className="section-title">Sign in to Cyber Wolf Chain</h2>
        <p className="muted">
          Your streak, skills and badges are waiting.
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
              placeholder="Your password"
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="feedback err">{error}</p> : null}

          <button className="btn auth-submit" type="submit">
            Sign in
          </button>
        </form>

        <p className="muted auth-switch">
          New to the pack? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
