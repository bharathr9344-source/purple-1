import { Link } from "react-router-dom";

import { useAuth } from "../context/auth";
import { useProgress } from "../context/progress";
import rooms from "../data/rooms";import {
  avgScore,
  computeRoomScore,
  earnedBadges,
  maxPoints,
  rankFor,
  totalPoints,
} from "../utils/scoring";
import {
  computeSkills,
  formatMemberSince,
  skillLabel,
} from "../utils/profile";

const ICONS = {
  target: "🎯",
  brain: "🧠",
  syringe: "💉",
  key: "🔑",
  link: "⛓️",
  trophy: "🏆",
  crown: "👑",
  sword: "⚔️",
  shield: "🛡️",
  seedling: "🌱",
};

function initials(name) {
  return String(name || "?")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase())
    .slice(0, 2)
    .join("") || "?";
}

function formatTime(sec) {
  if (!sec && sec !== 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export default function Profile() {
  const { user, userId, logout, streak, longestStreak, mode, setMode } =
    useAuth();
  const { progress } = useProgress();

  const points = totalPoints(rooms, progress);
  const max = maxPoints(rooms);
  const rank = rankFor(points, rooms);
  const completed = rooms.filter(
    (r) => progress.rooms[r.id]?.status === "completed"
  );
  const badges = earnedBadges(rooms, progress);
  const avg = avgScore(rooms, progress);
  const skills = computeSkills(rooms, progress);

  if (!user) return null;

  return (
    <main className="page profile-page">
      <header className="card profile-head">
        <div className="profile-top">
          <div className="profile-avatar">{initials(user.username)}</div>
          <div className="profile-id">
            <p className="eyebrow">CYBER WOLF CHAIN HUNTER</p>
            <h2 className="section-title">{user.username}</h2>
            <div className="profile-id-row">
              <span className="user-id-chip" title="Your unique hunter ID">
                ID {userId}
              </span>
              <span className="pill medium">Member since {formatMemberSince(user.createdAt)}</span>
            </div>
          </div>
          <div className="profile-rank">
            <span className="stat-icon">{ICONS[rank.icon]}</span>
            <strong>{rank.name}</strong>
            <span className="muted">
              {points} / {max} pts
            </span>
          </div>
        </div>

        <div className="room-progress profile-rank-bar">
          <div className="room-progress-bar">
            <span style={{ width: `${Math.min(100, (points / max) * 100)}%` }} />
          </div>
          <span className="room-progress-label">
            {Math.round((points / max) * 100)}% of the pack's max points
          </span>
        </div>
      </header>

      <section className="card mode-card">
        <div className="mode-card-head">
          <p className="eyebrow">CHOOSE YOUR PATH</p>
          <p className="muted">
            This tunes your home screen and what we recommend first.
          </p>
        </div>
        <div className="mode-options">
          <button
            className={`mode-option ${mode === "learner" ? "on" : ""}`}
            onClick={() => setMode("learner")}
          >
            <span className="mode-icon">🐣</span>
            <b>Learner</b>
            <p className="muted">
              Guided, chapter-based lessons. Learn the basics, see how the
              exploit works step by step, then practice.
            </p>
            <span className="pill medium">
              {mode === "learner" ? "ACTIVE" : "Recommended for beginners"}
            </span>
          </button>
          <button
            className={`mode-option ${mode === "explorer" ? "on" : ""}`}
            onClick={() => setMode("explorer")}
          >
            <span className="mode-icon">🧭</span>
            <b>Explorer</b>
            <p className="muted">
              Straight into the vulnerable web. A sandbox full of buggy apps —
              hunt flags on your own, OWASP Juice Shop style.
            </p>
            <span className="pill medium">
              {mode === "explorer" ? "ACTIVE" : "For hands-on hunters"}
            </span>
          </button>
        </div>
      </section>

      <section className="dash-stats">
        <div className="card stat-card streak-card">
          <span className="stat-icon">🔥</span>
          <span className="stat-label">Daily Streak</span>
          <strong>{streak} days</strong>
          <span className="muted">longest {longestStreak} days</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Total Points</span>
          <strong>{points}</strong>
          <span className="muted">{max} max available</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Rooms Solved</span>
          <strong>{completed.length} / {rooms.length}</strong>
          <span className="muted">chains fully exploited</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Average Score</span>
          <strong>{avg}%</strong>
          <span className="muted">across solved rooms</span>
        </div>
      </section>

      <div className="dash-grid profile-grid">
        <section className="card skills-card">
          <p className="eyebrow">SKILLS</p>
          <div className="skill-list">
            {skills.map((s) => (
              <div className="skill-item" key={s.roomId}>
                <div className="skill-top">
                  <b>{s.skill}</b>
                  <span>{skillLabel(s.level)}</span>
                </div>
                <div className="skill-bar">
                  <span style={{ width: `${s.level}%` }} />
                </div>
                <small className="muted">
                  {s.detail} · room score {s.pct}%
                </small>
              </div>
            ))}
          </div>
        </section>

        <section className="card badges-card">
          <p className="eyebrow">BADGES</p>
          {badges.length ? (
            <div className="badge-grid">
              {badges.map((b) => (
                <div className="badge" key={b.id}>
                  <span className="badge-icon">{ICONS[b.icon]}</span>
                  <b>{b.name}</b>
                  <small className="muted">{b.desc}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">
              No badges yet. Complete your first chain to earn{" "}
              <b>First Blood</b>.
            </p>
          )}
        </section>
      </div>

      <section className="card solved-card">
        <div className="solved-head">
          <p className="eyebrow">SOLVED ROOMS</p>
          <Link to="/dashboard" className="btn ghost">
            Full Dashboard
          </Link>
        </div>
        <div className="solved-list">
          {rooms.map((room) => {
            const r = progress.rooms[room.id];
            const done = r?.status === "completed";
            const score = computeRoomScore(room, progress);
            return (
              <Link
                to={`/room/${room.id}`}
                className={`solved-item ${done ? "done" : ""}`}
                key={room.id}
              >
                <div className="solved-item-main">
                  <b>{room.title}</b>
                  <span className="muted">
                    {done
                      ? `Solved in ${formatTime(r.timeSec)} · ${score} pts`
                      : "Not solved yet"}
                  </span>
                </div>
                <span className={done ? "done" : "pill"}>{done ? "✓ SOLVED" : "PENDING"}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="dash-actions">
        <button
          className="btn secondary"
          onClick={() => {
            if (window.confirm("Sign out of Cyber Wolf Chain?")) logout();
          }}
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
