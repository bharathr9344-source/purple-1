import { useState } from "react";
import { Link } from "react-router-dom";

import { allCourses, allSkills, levels, paths } from "../data/curriculum";
import { useLearning } from "../context/learning";
import { useAuth } from "../context/auth";

const totalChapters = paths.reduce(
  (n, p) => n + p.courses.reduce((a, c) => a + c.chapters.length, 0),
  0
);

export default function Learn() {
  const { user } = useAuth();
  const { pathProgress, levelProgress } = useLearning();
  const [level, setLevel] = useState("all");
  const signedIn = Boolean(user);

  const visiblePaths =
    level === "all" ? paths : paths.filter((p) => p.level === Number(level));

  const featured = paths.filter((p) => p.featured);
  const regular = visiblePaths.filter((p) => !p.featured);

  return (
    <main className="page">
      <header className="dash-head">
        <p className="eyebrow">LEARNER PATH · CURRICULUM</p>
        <h2 className="section-title">The Cyber Wolf Curriculum</h2>
        <p className="muted">
          Twenty-one learning paths across five levels, including the six
          vulnerable playgrounds. Follow the roadmap from
          web fundamentals to the OWASP Top 10, then on to exploitation, cloud
          and the secure SDLC.
        </p>
      </header>

      <section className="stats-row">
        <div className="card stat-card">
          <span className="stat-icon">🗺️</span>
          <span className="stat-label">Learning Paths</span>
          <strong>{paths.length}</strong>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">📚</span>
          <span className="stat-label">Courses</span>
          <strong>{allCourses.length}</strong>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">🧩</span>
          <span className="stat-label">Chapters</span>
          <strong>{totalChapters}</strong>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">🎯</span>
          <span className="stat-label">Skills</span>
          <strong>{allSkills.length}</strong>
        </div>
      </section>

      {signedIn ? (
        <section className="level-selector card">
          {levels.map((lvl) => {
            const lp = levelProgress(lvl.level);
            return (
              <button
                key={lvl.level}
                className={`level-item ${level === String(lvl.level) ? "on" : ""}`}
                onClick={() => setLevel(String(lvl.level))}
              >
                <span className="level-num">L{lvl.level}</span>
                <div className="level-item-main">
                  <b>{lvl.name}</b>
                  <div className="hunt-progress-bar">
                    <div className="hunt-progress-fill" style={{ width: `${lp.pct}%` }} />
                  </div>
                </div>
                <span className="muted level-item-count">
                  {lp.done}/{lp.total}
                </span>
              </button>
            );
          })}
        </section>
      ) : (
        <p className="muted signin-nudge">
          <Link to="/login" className="btn ghost">
            Sign in
          </Link>{" "}
          to track your progress, earn skills and see your level.
        </p>
      )}

      {level === "all" ? (
        <section className="featured-tracks">
          {featured.map((p) => {
            const pp = signedIn ? pathProgress(p) : null;
            return (
              <article key={p.id} className="card track-card-lg">
                <div className="track-lg-top">
                  <span className="roadmap-emoji">{p.emoji}</span>
                  <span className="core-badge">★ CORE PATH</span>
                </div>
                <p className="eyebrow">{p.tagline}</p>
                <h3>{p.title}</h3>
                <p className="muted">{p.description}</p>
                <div className="track-lg-meta">
                  <span>📚 {p.courses.length} courses</span>
                  <span>
                    ⏱ {p.courses.reduce((n, c) => n + c.minutes, 0)} min
                  </span>
                  {p.id === "sdlc-compliance" ? (
                    <span className="chip">HIPAA · PCI-DSS · GDPR</span>
                  ) : null}
                </div>
                {pp ? (
                  <div className="hunt-progress">
                    <div className="hunt-progress-bar">
                      <div className="hunt-progress-fill" style={{ width: `${pp.pct}%` }} />
                    </div>
                    <span className="muted">
                      {pp.done}/{pp.total} chapters
                    </span>
                  </div>
                ) : null}
                <Link to={`/learn/path/${p.id}`} className="btn">
                  {p.id === "owasp-top10"
                    ? "Master the OWASP Top 10 →"
                    : "Open the SDLC & Compliance path →"}
                </Link>
              </article>
            );
          })}
        </section>
      ) : null}

      <section className="tracks-section">
        <div className="rooms-head">
          <h2 className="section-title">
            {level === "all" ? "All learning paths" : `Level ${level} paths`}
          </h2>
          <p className="muted">
            {level === "all"
              ? "Pick a track. Each path is a set of slide-based courses that earn you skills."
              : levels.find((l) => l.level === Number(level))?.note}
          </p>
        </div>

        <div className="level-filters">
          <button
            className={`filter-chip ${level === "all" ? "on" : ""}`}
            onClick={() => setLevel("all")}
          >
            All levels
          </button>
          {levels.map((l) => (
            <button
              key={l.level}
              className={`filter-chip ${level === String(l.level) ? "on" : ""}`}
              onClick={() => setLevel(String(l.level))}
            >
              L{l.level} · {l.name}
            </button>
          ))}
        </div>

        <div className="track-grid">
          {regular.map((p) => {
            const pp = signedIn ? pathProgress(p) : null;
            return (
              <Link
                to={`/learn/path/${p.id}`}
                key={p.id}
                className={`card track-card ${pp && pp.pct === 100 ? "done" : ""}`}
              >
                <div className="track-card-top">
                  <span className="roadmap-emoji">{p.emoji}</span>
                  <span className="diff-badge">L{p.level}</span>
                </div>
                <h3>{p.title}</h3>
                <p className="muted track-tagline">{p.tagline}</p>
                <div className="track-meta">
                  <span>📚 {p.courses.length} courses</span>
                  <span>
                    ⏱ {p.courses.reduce((n, c) => n + c.minutes, 0)} min
                  </span>
                </div>
                {pp ? (
                  <div className="hunt-progress">
                    <div className="hunt-progress-bar">
                      <div className="hunt-progress-fill" style={{ width: `${pp.pct}%` }} />
                    </div>
                    <span className="muted">
                      {pp.done}/{pp.total} chapters
                    </span>
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="card learn-tip">
        <span>💡</span>
        <p>
          Prefer hands-on? Switch your profile mode to <b>Explorer</b> and hit
          the <b>Playgrounds</b> — six themed worlds of vulnerable apps built
          from the exact CVEs you learn here.
        </p>
      </div>
    </main>
  );
}
