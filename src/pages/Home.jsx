import { Link } from "react-router-dom";

import rooms from "../data/rooms";
import { useAuth } from "../context/auth";
import { useProgress } from "../context/progress";
import { generateLearningGuide } from "../utils/pdf";
import { computeRoomScore, totalPoints, rankFor, maxPoints } from "../utils/scoring";

function Stars({ count }) {
  return (
    <span className="stars" aria-label={`${count} out of 5 difficulty`}>
      {"★".repeat(count)}
      <span className="stars-dim">{"★".repeat(5 - count)}</span>
    </span>
  );
}

export default function Home() {
  const { user, mode } = useAuth();
  const { progress, getRoom } = useProgress();
  const points = totalPoints(rooms, progress);
  const rank = rankFor(points, rooms);
  const completedCount = rooms.filter((r) => getRoom(r.id).status === "completed").length;

  return (
    <main className="page home-page">
      <section className="home-hero card">
        <div className="hero-top">
          <span className="hero-badge">CTF-STYLE CHAIN LEARNING</span>
          <span className="hero-status">
            {user ? `${mode === "learner" ? "🐣 Learner" : "🧭 Explorer"} mode` : "Safe · Simulated · Educational"}
          </span>
        </div>
        <div className="hero-grid">
          <div className="hero-content">
            <p className="eyebrow">TWO PATHS · ONE PACK</p>
            <h1>Learn attacks the way hackers chain them.</h1>
            <p className="lead">
              Learn the fundamentals in chapter-based lessons, then hunt flags
              inside vulnerable web apps. Exploit every link, map it to OWASP
              2025, score it with CVSS — and build your hunter profile.
            </p>
            <div className="hero-actions">
              {mode === "learner" ? (
                <>
                  <Link to="/learn" className="btn">
                    Start Learning
                  </Link>
                  <Link to="/playgrounds" className="btn secondary">
                    Try the Playground
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/playgrounds" className="btn">
                    Enter Playground
                  </Link>
                  <Link to="/learn" className="btn secondary">
                    Take a Lesson
                  </Link>
                </>
              )}
              {user ? (
                <Link to="/profile" className="btn ghost">
                  Switch Path
                </Link>
              ) : (
                <Link to="/register" className="btn ghost">
                  Join the Pack
                </Link>
              )}
              <button
                className="btn ghost"
                onClick={() => generateLearningGuide(rooms)}
              >
                📘 PDF Guide
              </button>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-chain">
              {["1", "2", "3", "4"].map((n, i) => (
                <span key={n} className={`chain-link-box ${i === 3 ? "impact" : ""}`}>
                  {i === 3 ? "Impact" : n}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span>Points</span>
            <strong>{points}</strong>
          </div>
          <div className="stat">
            <span>Rooms Completed</span>
            <strong>{completedCount}/{rooms.length}</strong>
          </div>
          <div className="stat">
            <span>Rank</span>
            <strong>{rank.name}</strong>
          </div>
          <div className="stat">
            <span>Max Points</span>
            <strong>{maxPoints(rooms)}</strong>
          </div>
        </div>
      </section>

      <section className="track-section">
        <div className="rooms-head">
          <h2 className="section-title">Choose your path</h2>
          <p className="muted">
            {mode === "learner"
              ? "You're in Learner mode — chapter-based lessons come first."
              : "You're in Explorer mode — the vulnerable web comes first."}
          </p>
        </div>
        <div className="track-grid">
          <article className={`card track-card ${mode === "learner" ? "featured" : ""}`}>
            <span className="track-icon">🐣</span>
            <p className="eyebrow">PATH 1 · LEARN</p>
            <h3>Learn the skills</h3>
            <p className="muted">
              A 21-path curriculum across five levels — web fundamentals, the
              OWASP Top 10, injection, access control, APIs, cloud, and the
              secure SDLC with HIPAA and PCI-DSS. Slide-based courses, one
              chapter at a time.
            </p>
            <div className="track-meta">
              <span>📚 71 courses · 5 levels</span>
              <span>🎯 81 skills</span>
            </div>
            <Link to="/learn" className="btn">
              Enter the Curriculum
            </Link>
          </article>

          <article className={`card track-card ${mode === "explorer" ? "featured" : ""}`}>
            <span className="track-icon">🧭</span>
            <p className="eyebrow">PATH 2 · EXPLORE</p>
            <h3>Hunt in the playground</h3>
            <p className="muted">
              Six real-looking apps — a school portal, a bank, a clinic, a
              treasure storefront, an OWASP Top 10 corporate portal, and a tea
              shop with a graph-based attack chain — each one hiding multiple
              vulnerabilities in its pages. Explore freely like a pentester and
              confirm findings with zero hand-holding.
            </p>
            <div className="track-meta">
              <span>🧪 54 live vulnerable features</span>
              <span>🏴 hidden flags</span>
            </div>
            <Link to="/playgrounds" className="btn">
              Enter the Playgrounds
            </Link>
          </article>
        </div>
      </section>

      <section className="rooms-section" id="rooms">
        <div className="rooms-head">
          <h2 className="section-title">Apply what you learn</h2>
          <p className="muted">Each room is one complete attack chain. Start with the easy one.</p>
        </div>

        <div className="room-grid">
          {rooms.map((room) => {
            const r = getRoom(room.id);
            const done = r.status === "completed";
            const score = computeRoomScore(room, progress);
            return (
              <article className={`card room-card ${done ? "done" : ""}`} key={room.id}>
                <div className="room-card-top">
                  <span className={`pill ${room.difficulty.toLowerCase()}`}>
                    {room.difficulty}
                  </span>
                  <Stars count={room.stars} />
                </div>

                <h3>{room.title}</h3>
                <p className="muted room-card-short">{room.short}</p>

                <div className="room-card-tags">
                  <span className="chip">{room.owasp.code} · #{room.owasp.rank}</span>
                  <span className="chip">{room.category}</span>
                </div>

                <div className="room-card-meta">
                  <span>⏱ {room.estTime}</span>
                  <span>★ {room.points} pts</span>
                </div>

                <div className="room-card-actions">
                  {done ? (
                    <Link to={`/room/${room.id}`} className="btn secondary">
                      Replay · {score} pts
                    </Link>
                  ) : (
                    <Link to={`/room/${room.id}`} className="btn">
                      Start Chain
                    </Link>
                  )}
                  <Link to={`/room/${room.id}/analysis`} className="btn ghost">
                    Preview
                  </Link>
                  <a
                    href={`/writeups/${room.id}.md`}
                    download={`${room.id}-writeup.md`}
                    className="btn ghost"
                  >
                    Writeup
                  </a>
                </div>

                {done ? <span className="done">COMPLETED</span> : null}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
