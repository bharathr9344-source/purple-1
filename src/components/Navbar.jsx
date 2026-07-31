import { NavLink } from "react-router-dom";

import { useAuth } from "../context/auth";
import { useProgress } from "../context/progress";
import rooms from "../data/rooms";
import { totalPoints } from "../utils/scoring";

const linkClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;

export default function Navbar() {
  const { user, streak } = useAuth();
  const { progress } = useProgress();
  const points = totalPoints(rooms, progress);

  return (
    <header className="navbar">
      <div>
        <div className="brand">
          <span>Cyber Wolf</span> Chain
        </div>
        <div className="brand-sub">Attack-Chain CTF Labs</div>
      </div>

      <nav className="nav-links">
        <NavLink to="/" className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/learn" className={linkClass}>
          Learn
        </NavLink>
        <NavLink to="/playgrounds" className={linkClass}>
          Playgrounds
        </NavLink>
        {user ? (
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
        ) : null}
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
      </nav>

      <div className="nav-right">
        {user ? (
          <>
            <span className="nav-streak" title="Daily streak">
              🔥 {streak}
            </span>
            <span className="nav-user" title={user.username}>
              {user.username.slice(0, 2).toUpperCase()}
            </span>
          </>
        ) : (
          <>
            <NavLink to="/login" className="nav-link">
              Sign in
            </NavLink>
            <NavLink to="/register" className="btn nav-register">
              Join the Pack
            </NavLink>
          </>
        )}
        <span className="nav-points">
          <span className="nav-points-icon">◆</span>
          {points} pts
        </span>
      </div>
    </header>
  );
}
