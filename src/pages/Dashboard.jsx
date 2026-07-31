import { Link } from "react-router-dom";

import rooms from "../data/rooms";
import { levels, paths } from "../data/curriculum";
import { useAuth } from "../context/auth";
import { useProgress } from "../context/progress";
import { useLearning } from "../context/learning";
import {
  avgScore,
  computeRoomScore,
  earnedBadges,
  maxPoints,
  rankFor,
  totalPoints,
} from "../utils/scoring";
import { computeSkills, skillLabel } from "../utils/profile";

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

export default function Dashboard() {
  const { user, userId, streak, longestStreak } = useAuth();
  const { progress, resetProgress } = useProgress();
  const { levelProgress, learnedSkills } = useLearning();
  const points = totalPoints(rooms, progress);
  const rank = rankFor(points, rooms);
  const completed = rooms.filter(
    (r) => progress.rooms[r.id]?.status === "completed"
  );
  const badges = earnedBadges(rooms, progress);
  const avg = avgScore(rooms, progress);
  const max = maxPoints(rooms);
  const skills = computeSkills(rooms, progress);
  const allSkills = paths.flatMap((p) => learnedSkills(p));

  return (
    <main className="page">
      <header className="dash-head">
        <p className="eyebrow">YOUR PROGRESS</p>
        <h2 className="section-title">Dashboard</h2>
        <p className="muted">Every exploit you land moves you up the ladder.</p>
      </header>

      <section className="card dash-identity">
        <div className="profile-avatar">{user ? user.username.slice(0, 2).toUpperCase() : "?"}</div>
        <div>
          <p className="eyebrow">HUNTER</p>
          <h3>{user ? user.username : "Guest"}</h3>
          <span className="user-id-chip">{userId ? `ID ${userId}` : "Sign in to save your profile"}</span>
        </div>
        <div className="dash-streak">
          <span className="stat-icon">🔥</span>
          <div>
            <strong>{streak} day{streak === 1 ? "" : "s"}</strong>
            <span className="muted">daily streak · best {longestStreak}</span>
          </div>
        </div>
        <Link to="/profile" className="btn secondary">
          View Profile
        </Link>
      </section>

      <section className="dash-stats">
        <div className="card stat-card">
          <span className="stat-icon">{ICONS[rank.icon]}</span>
          <span className="stat-label">Current Rank</span>
          <strong>{rank.name}</strong>
          <span className="muted">{points} / {max} pts</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Total Points</span>
          <strong>{points}</strong>
          <span className="muted">hints cost 20 · attempts cost 2</span>
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

      <section className="dash-learning">
        <div className="card learning-overview">
          <p className="eyebrow">LEARNING CURRICULUM</p>
          <div className="dash-learning-top">
            <h3>📚 Cyber Wolf Curriculum</h3>
            <Link to="/learn" className="btn secondary">
              Open the Curriculum
            </Link>
          </div>
          <div className="level-strip">
            {levels.map((lvl) => {
              const lp = levelProgress(lvl.level);
              return (
                <div key={lvl.level} className="level-strip-item">
                  <span className="level-num">L{lvl.level}</span>
                  <div className="hunt-progress-bar">
                    <div
                      className="hunt-progress-fill"
                      style={{ width: `${lp.pct}%` }}
                    />
                  </div>
                  <span className="muted">
                    {lp.done}/{lp.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card learning-skills">
          <p className="eyebrow">SKILLS EARNED</p>
          <div className="skill-chips">
            {allSkills.length > 0 ? (
              allSkills.map((s) => (
                <span key={s} className="filter-chip on">
                  #{s}
                </span>
              ))
            ) : (
              <span className="muted">
                Complete courses to earn skills — start with the OWASP Top 10.
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="dash-grid">
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
          <div className="badge-grid">
            {badges.map((b) => (
              <div className="badge" key={b.id}>
                <span className="badge-icon">{ICONS[b.icon]}</span>
                <b>{b.name}</b>
                <small className="muted">{b.desc}</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card rooms-perf">
        <p className="eyebrow">ROOM PERFORMANCE</p>
        <div className="perf-list">
          {rooms.map((room) => {
            const r = progress.rooms[room.id];
            const done = r?.status === "completed";
            const score = computeRoomScore(room, progress);
            const pct = Math.round((score / (room.points + 25)) * 100);
            return (
              <div className="perf-item" key={room.id}>
                <div className="perf-top">
                  <b>{room.title}</b>
                  <span className={done ? "done" : "pill"}>{done ? "DONE" : "PENDING"}</span>
                </div>
                <div className="perf-bar">
                  <span style={{ width: `${done ? pct : 0}%` }} />
                </div>
                <span className="muted">
                  {done ? `${score} pts · ${pct}%` : "Not started"}
                </span>
              </div>
            );
          })}
        </div>
        <Link to="/report" className="btn">
          Generate My Report
        </Link>
      </section>

      <div className="dash-actions">
        <button className="btn secondary" onClick={() => { if (window.confirm("Reset all progress and points?")) resetProgress(); }}>
          Reset Progress
        </button>
      </div>
    </main>
  );
}
