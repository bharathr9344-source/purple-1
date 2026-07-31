import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { findPlayground } from "../data/playgrounds";
import { useHunt } from "../context/hunt";

const DIFF_STARS = { easy: 1, medium: 2, hard: 3 };

function Difficulty({ level }) {
  const n = DIFF_STARS[level] || 1;
  return (
    <span className="diff-stars" title={`${level} difficulty`}>
      {"⭐".repeat(n)}
      <span className="muted">{"☆".repeat(3 - n)}</span>
    </span>
  );
}

function LearnPanel({ learn }) {
  const parts = learn.split(/Fix:\s*/i);
  const fix = parts.length > 1 ? parts.slice(1).join("Fix: ").trim() : null;
  const how = parts[0].trim();
  return (
    <div className="learn-panel">
      <div className="learn-col">
        <p className="learn-label">🧨 How it works</p>
        <p className="learn-text">{how}</p>
      </div>
      {fix ? (
        <div className="learn-col">
          <p className="learn-label">🛡️ How to prevent it</p>
          <p className="learn-text">{fix}</p>
        </div>
      ) : null}
    </div>
  );
}

function DoneTask({ app, step }) {
  return (
    <section className="card task-card done">
      <div className="task-head">
        <div className="task-title">
          <span className="task-check">✓</span>
          <div>
            <p className="eyebrow">TASK {step} · {app.category}</p>
            <h3>{app.name}</h3>
            <Difficulty level={app.difficulty} />
          </div>
        </div>
        <span className="task-solved">SOLVED</span>
      </div>
      <div className="task-reveal">
        <span>🏴 FLAG CAPTURED</span>
        <code>{app.flag}</code>
      </div>
      <div className="task-learn">
        <LearnPanel learn={app.learn} />
      </div>
    </section>
  );
}

function LockedTask({ app, step }) {
  return (
    <section className="card task-card locked">
      <div className="task-head">
        <div className="task-title">
          <span className="task-lock">🔒</span>
          <div>
            <p className="eyebrow">TASK {step} · {app.category}</p>
            <h3>{app.name}</h3>
            <Difficulty level={app.difficulty} />
          </div>
        </div>
        <span className="muted">Locked</span>
      </div>
      <p className="muted task-locked-note">
        Complete the previous task to unlock this challenge.
      </p>
    </section>
  );
}

function ActiveTask({ app, step, onReveal }) {
  const [resetKey, setResetKey] = useState(0);
  const [learnOpen, setLearnOpen] = useState(false);

  return (
    <section id="active-task" className="card task-card active">
      <div className="task-head">
        <div className="task-title">
          <div>
            <p className="eyebrow">TASK {step} · {app.category}</p>
            <h3>{app.name}</h3>
            <Difficulty level={app.difficulty} />
          </div>
        </div>
        <span className="task-current">CURRENT TASK</span>
      </div>

      <p className="muted task-goal">🎯 {app.goal}</p>

      <div key={resetKey}>{app.render({ onReveal })}</div>

      <p className="muted playground-hint">💡 {app.hint}</p>

      <button className="learn-toggle" onClick={() => setLearnOpen((o) => !o)}>
        <span>{learnOpen ? "▾" : "▸"}</span>
        How this vulnerability works & how to fix it
      </button>
      {learnOpen ? (
        <div className="learn-explain">
          <LearnPanel learn={app.learn} />
        </div>
      ) : null}

      <button className="btn ghost reset-task" onClick={() => setResetKey((k) => k + 1)}>
        ↻ Reset this app
      </button>
    </section>
  );
}

function SiteMode({ playground, progress, complete, found, onReveal, resetPlayground }) {
  const [lastFound, setLastFound] = useState(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [peek, setPeek] = useState({});

  const handleReveal = (appId) => {
    onReveal(appId);
    const app = playground.apps.find((a) => a.id === appId);
    if (app) setLastFound(app);
  };

  return (
    <main className="page">
      <header className="dash-head">
        <Link to="/playgrounds" className="muted">
          ← All playgrounds
        </Link>
        <p className="eyebrow">
          {playground.emoji} {playground.theme} · {playground.difficulty}
        </p>
        <h2 className="section-title">{playground.name}</h2>
        <p className="muted">{playground.story}</p>
      </header>

      <div className="sandbox-notice">
        <span className="sandbox-icon">🧪</span>
        <div>
          <b>100% sandboxed.</b> This is one app that looks and behaves like the
          real thing but runs entirely inside your browser — nothing here can
          ever touch the real host. Explore every page like a real pentest:
          there's no checklist, and everything is a lead.
        </div>
      </div>

      <div className="playground-summary">
        <div className="card stat-card">
          <span className="stat-icon">🔍</span>
          <span className="stat-label">Findings Confirmed</span>
          <strong>
            {progress.done}/{progress.total}
          </strong>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">⛓️</span>
          <span className="stat-label">Attack Chain Steps</span>
          <strong>{playground.chain.length}</strong>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">🎯</span>
          <span className="stat-label">Real CVEs</span>
          <strong>{playground.cves.length}</strong>
        </div>
      </div>

      <div className="hunt-progress big">
        <div className="hunt-progress-bar">
          <div
            className="hunt-progress-fill"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
        <span className="muted">
          {progress.done}/{progress.total} vulnerabilities confirmed ·{" "}
          {progress.pct}%
        </span>
      </div>

      <div className="site-stage">
        {playground.site({ onReveal: handleReveal })}
      </div>

      {lastFound ? (
        <div className="congrats-banner">
          <span className="congrats-emoji">🎉</span>
          <div className="congrats-body">
            <p className="eyebrow">FINDING CONFIRMED</p>
            <h3>
              {lastFound.name} — {lastFound.category}
            </h3>
            <p>
              You captured <code>{lastFound.flag}</code>. Confirmed{" "}
              {progress.done}/{progress.total} vulnerabilities so far — keep
              exploring.
            </p>
            <div className="congrats-learn">
              <LearnPanel learn={lastFound.learn} />
            </div>
          </div>
          <button className="btn" onClick={() => setLastFound(null)}>
            Keep exploring →
          </button>
        </div>
      ) : null}

      {complete ? (
        <div className="hunt-complete">
          <p className="eyebrow">PENTEST COMPLETE</p>
          <h3>🎉 You confirmed every vulnerability in this app.</h3>
          <p>
            Open the post-breach report to see the professional writeup — the
            CVEs, the CVSS score, and what secure teams do to stop it. Or
            download it as a PDF.
          </p>
          <div className="hunt-complete-actions">
            <Link to={`/playgrounds/${playground.id}/analysis`} className="btn">
              📄 Open the Post-Breach Report
            </Link>
            <button
              className="btn ghost"
              onClick={() => {
                setLastFound(null);
                setPanelOpen(true);
                resetPlayground(playground.id);
              }}
            >
              Reset findings
            </button>
          </div>
        </div>
      ) : null}

      <section className="card findings-card">
        <button
          className="findings-toggle"
          onClick={() => setPanelOpen((o) => !o)}
        >
          <span>{panelOpen ? "▾" : "▸"}</span>
          📋 Your findings — {progress.done}/{progress.total} confirmed
        </button>
        {panelOpen ? (
          <div className="findings-list">
            {playground.apps.map((app, i) => {
              const captured = found.includes(app.id);
              return (
                <div key={app.id} className={`finding ${captured ? "done" : ""}`}>
                  <div className="finding-head">
                    <span className="finding-icon">
                      {captured ? "✅" : "🔍"}
                    </span>
                    <div className="finding-title">
                      <p className="eyebrow">
                        FINDING {String(i + 1).padStart(2, "0")} · {app.category}
                      </p>
                      <h4>{app.name}</h4>
                      <Difficulty level={app.difficulty} />
                    </div>
                    <span className={`finding-status ${captured ? "on" : ""}`}>
                      {captured ? "CONFIRMED" : "Unconfirmed"}
                    </span>
                  </div>
                  {captured ? (
                    <div className="finding-detail">
                      <p className="muted">
                        🏴 <code>{app.flag}</code>
                      </p>
                      <div className="finding-learn">
                        <LearnPanel learn={app.learn} />
                      </div>
                    </div>
                  ) : (
                    <div className="finding-detail">
                      <button
                        className="finding-peek"
                        onClick={() => setPeek((p) => ({ ...p, [app.id]: !p[app.id] }))}
                      >
                        {peek[app.id] ? "Hide hint" : "💡 Peek a hint"}
                      </button>
                      {peek[app.id] ? (
                        <p className="muted finding-hint">{app.hint}</p>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default function Hunt() {
  const { id } = useParams();
  const {
    isCaptured,
    captureFlag,
    playgroundProgress,
    isPlaygroundComplete,
    resetPlayground,
  } = useHunt();
  const [justSolved, setJustSolved] = useState(null);

  const playground = findPlayground(id);
  if (!playground) return <Navigate to="/playgrounds" replace />;

  const progress = playgroundProgress(playground);
  const complete = isPlaygroundComplete(playground);

  const handleReveal = (app, value) => {
    captureFlag(playground.id, app.id);
    setJustSolved({ app, flag: value });
  };

  if (playground.site) {
    const found = playground.apps
      .filter((a) => isCaptured(playground.id, a.id))
      .map((a) => a.id);
    return (
      <SiteMode
        playground={playground}
        progress={progress}
        complete={complete}
        found={found}
        onReveal={(appId) => captureFlag(playground.id, appId)}
        resetPlayground={resetPlayground}
      />
    );
  }

  const activeIndex = playground.apps.findIndex(
    (a) => !isCaptured(playground.id, a.id)
  );

  const nextTask = () => {
    setJustSolved(null);
    requestAnimationFrame(() => {
      document.getElementById("active-task")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <main className="page">
      <header className="dash-head">
        <Link to="/playgrounds" className="muted">
          ← All playgrounds
        </Link>
        <p className="eyebrow">
          {playground.emoji} {playground.theme} · {playground.difficulty}
        </p>
        <h2 className="section-title">{playground.name}</h2>
        <p className="muted">{playground.story}</p>
      </header>

      <div className="sandbox-notice">
        <span className="sandbox-icon">🧪</span>
        <div>
          <b>100% sandboxed.</b> These apps look and behave like the real thing
          but run entirely inside your browser — nothing here can ever touch the
          real host. Break them as much as you like.
        </div>
      </div>

      <div className="playground-summary">
        <div className="card stat-card">
          <span className="stat-icon">🏴</span>
          <span className="stat-label">Flags Captured</span>
          <strong>
            {progress.done}/{progress.total}
          </strong>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">⛓️</span>
          <span className="stat-label">Attack Chain Steps</span>
          <strong>{playground.chain.length}</strong>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">🎯</span>
          <span className="stat-label">Real CVEs</span>
          <strong>{playground.cves.length}</strong>
        </div>
      </div>

      <div className="hunt-progress big">
        <div className="hunt-progress-bar">
          <div
            className="hunt-progress-fill"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
        <span className="muted">
          Task {progress.done}/{progress.total} · {progress.pct}% complete
        </span>
      </div>

      <section className="card attack-chain-card">
        <p className="eyebrow">THE MISSION</p>
        <ol className="attack-chain">
          {playground.chain.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {justSolved ? (
        <div className="congrats-banner">
          <span className="congrats-emoji">🎉</span>
          <div className="congrats-body">
            <p className="eyebrow">TASK {activeIndex}/{playground.apps.length} COMPLETE</p>
            <h3>Congratulations — you got it!</h3>
            <p>
              You found <code>{justSolved.flag}</code> in{" "}
              <b>{justSolved.app.name}</b>. That's{" "}
              <b>{justSolved.app.category}</b> — you know it now.
            </p>
            <div className="congrats-learn">
              <LearnPanel learn={justSolved.app.learn} />
            </div>
          </div>
          <button className="btn" onClick={nextTask}>
            Next task →
          </button>
        </div>
      ) : null}

      {complete ? (
        <div className="hunt-complete">
          <p className="eyebrow">MISSION COMPLETE</p>
          <h3>🎉 You cleared every task in this playground.</h3>
          <p>
            Open the attack analysis to see exactly how this breach happens in
            the real world — the CVEs, the CVSS score, and what secure teams do
            to stop it.
          </p>
          <div className="hunt-complete-actions">
            <Link to={`/playgrounds/${playground.id}/analysis`} className="btn">
              📖 Read the Attack Analysis
            </Link>
            <button
              className="btn ghost"
              onClick={() => resetPlayground(playground.id)}
            >
              Restart this mission
            </button>
          </div>
        </div>
      ) : (
        <p className="muted mission-note">
          {justSolved
            ? "Keep going — the next task is ready below."
            : `Solve task ${Math.min(activeIndex + 1, progress.total)} to move on.`}
        </p>
      )}

      <div className="task-list">
        {playground.apps.map((app, i) => {
          if (isCaptured(playground.id, app.id)) {
            return <DoneTask key={app.id} app={app} step={i + 1} />;
          }
          if (i === activeIndex) {
            return (
              <ActiveTask
                key={app.id}
                app={app}
                step={i + 1}
                onReveal={(v) => handleReveal(app, v)}
              />
            );
          }
          return <LockedTask key={app.id} app={app} step={i + 1} />;
        })}
      </div>
    </main>
  );
}
