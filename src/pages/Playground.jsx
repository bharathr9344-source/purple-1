import { useState } from "react";
import { Link } from "react-router-dom";

import { PlaygroundApps, VULN_FILTERS } from "../utils/playgroundApps";

function AppSim({ app, revealed, onReveal, onReset }) {
  const [resetKey, setResetKey] = useState(0);
  const [learnOpen, setLearnOpen] = useState(false);

  return (
    <section className="card playground-stage">
      <div className="playground-top">
        <div>
          <p className="eyebrow">{app.category}</p>
          <h3>{app.name}</h3>
          <p className="muted playground-goal">{app.goal}</p>
        </div>
        <button
          className="btn ghost"
          onClick={() => {
            onReset();
            setResetKey((k) => k + 1);
          }}
        >
          Reset app
        </button>
      </div>

      <div key={resetKey}>{app.render({ onReveal })}</div>

      {revealed ? (
        <div className="playground-captured">
          <span>🏴 FLAG CAPTURED</span>
          <code>{String(revealed)}</code>
        </div>
      ) : (
        <p className="muted playground-hint">💡 {app.hint}</p>
      )}

      <button
        className="learn-toggle"
        onClick={() => setLearnOpen((o) => !o)}
      >
        <span>{learnOpen ? "▾" : "▸"}</span>
        How this vulnerability works & how to fix it
      </button>
      {learnOpen ? <p className="learn-explain">{app.learn}</p> : null}
    </section>
  );
}

export default function Playground() {
  const [activeId, setActiveId] = useState(PlaygroundApps[0].id);
  const [filter, setFilter] = useState("all");
  const [found, setFound] = useState({});

  const visible = PlaygroundApps.filter(
    (a) => filter === "all" || a.filter === filter
  );
  const active =
    PlaygroundApps.find((a) => a.id === activeId) || PlaygroundApps[0];

  const handleReveal = (value) => {
    setFound((f) => ({ ...f, [active.id]: value }));
  };

  const handleReset = () => {
    setFound((f) => {
      const next = { ...f };
      delete next[active.id];
      return next;
    });
  };

  const capturedCount = Object.keys(found).length;

  return (
    <main className="page">
      <header className="dash-head">
        <p className="eyebrow">EXPLORER PATH · OPEN SANDBOX</p>
        <h2 className="section-title">The Vulnerable Web Treasury</h2>
        <p className="muted">
          A living museum of deliberately vulnerable apps — every one a real
          OWASP Top 10 bug you can poke, break and learn from. No hand-holding,
          no danger: everything is simulated.
        </p>
      </header>

      <div className="playground-summary">
        <div className="card stat-card">
          <span className="stat-icon">🏴</span>
          <span className="stat-label">Flags Captured</span>
          <strong>
            {capturedCount}/{PlaygroundApps.length}
          </strong>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">🧪</span>
          <span className="stat-label">Vulnerable Apps</span>
          <strong>{PlaygroundApps.length}</strong>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">🛡️</span>
          <span className="stat-label">OWASP Categories</span>
          <strong>{VULN_FILTERS.length - 1}</strong>
          <span className="muted">5 classic bug classes</span>
        </div>
      </div>

      <div className="playground-filters">
        {VULN_FILTERS.map((f) => (
          <button
            key={f.id}
            className={`filter-chip ${filter === f.id ? "on" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="playground-layout">
        <aside className="playground-list">
          <p className="eyebrow">AVAILABLE APPS</p>
          {visible.map((app) => {
            const captured = Boolean(found[app.id]);
            return (
              <button
                key={app.id}
                className={`playground-app ${app.id === active.id ? "on" : ""}`}
                onClick={() => setActiveId(app.id)}
              >
                <b>{app.name}</b>
                <span className="muted">{app.category.split("·")[0]}</span>
                {captured ? (
                  <span className="playground-flag">🏴</span>
                ) : null}
              </button>
            );
          })}
          <Link to="/learn" className="btn secondary">
            📚 Need a lesson first?
          </Link>
        </aside>

        <AppSim
          key={active.id}
          app={active}
          revealed={found[active.id] || null}
          onReveal={handleReveal}
          onReset={handleReset}
        />
      </div>
    </main>
  );
}
