import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import rooms from "../data/rooms";
import SimBrowser from "../components/SimBrowser";
import { hasSim } from "../utils/sim";
import { generateLearningGuide } from "../utils/pdf";
import { useProgress } from "../context/progress";
import {
  computeRoomScore,
  matchesAnswer,
  roomAttempts,
  roomHints,
} from "../utils/scoring";

function formatTime(sec) {
  if (!sec && sec !== 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export default function Room() {
  const { roomId } = useParams();
  const room = rooms.find((r) => r.id === roomId);
  const { progress, getRoom, solveStep, failAttempt, takeHint, completeRoom } =
    useProgress();

  const [input, setInput] = useState("");
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [justSolved, setJustSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const [simCaptured, setSimCaptured] = useState(false);

  if (!room) return <Navigate to="/" replace />;

  const r = getRoom(room.id);
  const solvedCount = r.stepsSolved.length;
  const allSolved = solvedCount === room.steps.length;
  const completed = r.status === "completed" || finished;
  const stepIndex = Math.min(solvedCount, room.steps.length - 1);
  const step = room.steps[stepIndex];

  const score = computeRoomScore(room, progress);
  const hints = roomHints(room, progress);
  const attempts = roomAttempts(room, progress);

  const advance = () => {
    setInput("");
    setSelected(null);
    setFeedback(null);
    setHintOpen(false);
    setJustSolved(false);
    setSimCaptured(false);
  };

  const handleSimCapture = (value) => {
    setInput(value);
    setSimCaptured(true);
  };

  const handleSubmit = () => {
    if (!step || justSolved) return;

    if (step.kind === "choice") {
      if (selected === null) return;
      if (selected === step.correct) {
        solveStep(room.id, step.id);
        setJustSolved(true);
        setFeedback({ ok: true, message: "Correct. The next link in the chain is forged." });
      } else {
        failAttempt(room.id, step.id);
        setFeedback({ ok: false, message: "Not the right answer — re-read the scenario and the chain so far." });
      }
      return;
    }

    if (matchesAnswer(input, step.answers)) {
      solveStep(room.id, step.id);
      setJustSolved(true);
      setFeedback({ ok: true, message: "Exploited successfully. The next link in the chain is forged." });
    } else {
      failAttempt(room.id, step.id);
      setFeedback({ ok: false, message: "Not quite — that doesn't trigger the vulnerability. Inspect the scenario and try again." });
    }
  };

  const handleRevealHint = () => {
    if (hintOpen) return;
    takeHint(room.id, step.id);
    setHintOpen(true);
  };

  const handleComplete = () => {
    completeRoom(room.id);
    setFinished(true);
  };

  const isLast = stepIndex === room.steps.length - 1;

  return (
    <main className="page">
      <div className="breadcrumb">
        <Link to="/">Rooms</Link>
        <span>/</span>
        <span>{room.title}</span>
      </div>

      <header className="card room-head">
        <div className="room-head-top">
          <div>
            <p className="eyebrow">CHAIN ROOM · {room.category.toUpperCase()}</p>
            <h2 className="section-title">{room.title}</h2>
            <p className="muted room-story">{room.story}</p>
          </div>
          <span className={`pill ${room.difficulty.toLowerCase()}`}>
            {room.difficulty}
          </span>
        </div>

        <div className="room-meta">
          <span className="chip">
            <b>OWASP</b> {room.owasp.code} · #{room.owasp.rank}
          </span>
          <span className="chip">
            <b>Chain</b> {room.chainTitle}
          </span>
          <span className="chip">
            <b>Time</b> {room.estTime}
          </span>
          <span className="chip">
            <b>Points</b> {room.points}
          </span>
          <span className="chip">
            <b>Writeup</b>{" "}
            <a href={`/writeups/${room.id}.md`} download={`${room.id}-writeup.md`}>
              .md ↓
            </a>
          </span>
        </div>

        <div className="room-toolbar">
          <button
            className="btn ghost"
            onClick={() => generateLearningGuide(rooms)}
          >
            📘 Download PDF Guide
          </button>
        </div>

        <div className="room-progress">
          <div className="room-progress-bar">
            <span
              style={{ width: `${(solvedCount / room.steps.length) * 100}%` }}
            />
          </div>
          <span className="room-progress-label">
            {solvedCount}/{room.steps.length} links exploited
          </span>
        </div>
      </header>

      <div className="room-tabs">
        <Link to={`/room/${room.id}`} className="room-tab active">
          Lab
        </Link>
        <Link to={`/room/${room.id}/chain`} className="room-tab">
          Attack Chain
        </Link>
        <Link to={`/room/${room.id}/analysis`} className="room-tab">
          Analysis
        </Link>
      </div>

      <div className="room-grid">
        <div className="room-main">
          <div className="step-track">
            {room.steps.map((s, i) => {
              const solved = r.stepsSolved.includes(s.id);
              const isCurrent = i === stepIndex && !justSolved;
              return (
                <div
                  key={s.id}
                  className={`step-dot ${solved ? "solved" : ""} ${isCurrent ? "current" : ""}`}
                  title={`${i + 1}. ${s.title}`}
                >
                  {solved ? "✓" : i + 1}
                </div>
              );
            })}
          </div>

          {completed ? (
            <section className="card room-done">
              <p className="eyebrow">CHAIN COMPLETE</p>
              <h3>You broke the whole chain</h3>
              <p className="muted">{room.chainImpact}</p>

              <div className="done-stats">
                <div className="stat">
                  <span>Room Score</span>
                  <strong>{score}</strong>
                </div>
                <div className="stat">
                  <span>Time</span>
                  <strong>{formatTime(r.timeSec)}</strong>
                </div>
                <div className="stat">
                  <span>Hints Used</span>
                  <strong>{hints}</strong>
                </div>
                <div className="stat">
                  <span>Attempts</span>
                  <strong>{attempts}</strong>
                </div>
              </div>

              <div className="done-actions">
                <Link to={`/room/${room.id}/chain`} className="btn">
                  View Attack Chain
                </Link>
                <Link to={`/room/${room.id}/analysis`} className="btn secondary">
                  OWASP + CVSS Analysis
                </Link>
                <Link to="/dashboard" className="btn secondary">
                  Dashboard
                </Link>
              </div>
            </section>
          ) : allSolved && !justSolved ? (
            <section className="card room-done">
              <p className="eyebrow">ALL LINKS EXPLOITED</p>
              <h3>Chain broken — claim your score</h3>
              <p className="muted">
                You exploited every link. Lock in your score, badge and report.
              </p>
              <div className="done-actions">
                <button className="btn" onClick={handleComplete}>
                  Complete Room · {score} pts
                </button>
              </div>
            </section>
          ) : justSolved ? (
            <section className="card step-card solved-card">
              <p className="eyebrow">
                STEP {stepIndex + 1} SOLVED · {step.title.toUpperCase()}
              </p>
              <h3>{step.teach}</h3>

              <div className="teach-grid">
                <div className="teach-box bad">
                  <span>What mistake caused it</span>
                  <p>{step.mistake}</p>
                </div>
                <div className="teach-box">
                  <span>How attackers use it</span>
                  <p>{step.teach}</p>
                </div>
              </div>

              <div className="done-actions">
                {isLast ? (
                  <button className="btn" onClick={advance}>
                    Reveal Final Impact →
                  </button>
                ) : (
                  <button className="btn" onClick={advance}>
                    Next Link →
                  </button>
                )}
              </div>
            </section>
          ) : (
            <section className="card step-card">
              <p className="eyebrow">
                STEP {stepIndex + 1} / {room.steps.length} · {step.title}
              </p>
              <h3 className="step-objective">{step.objective}</h3>

              {hasSim(room, step) ? (
                <>
                  <SimBrowser
                    room={room}
                    step={step}
                    onReveal={handleSimCapture}
                    onLoggedIn={handleSimCapture}
                  />
                  {simCaptured ? (
                    <p className="feedback ok">
                      Captured! The flag is in your answer box — submit it to
                      break the next link.
                    </p>
                  ) : null}
                </>
              ) : (
                <div className="scenario-panel">
                  <pre>{step.scenario}</pre>
                </div>
              )}

              {step.kind === "choice" ? (
                <div className="choice-list">
                  {step.options.map((opt, i) => (
                    <button
                      key={i}
                      className={`choice-btn ${selected === i ? "selected" : ""}`}
                      onClick={() => setSelected(i)}
                    >
                      <span className="choice-letter">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="answer-row">
                  <input
                    className="answer-input"
                    placeholder="Enter your payload / flag…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  <button className="btn" onClick={handleSubmit}>
                    Submit
                  </button>
                </div>
              )}

              {feedback ? (
                <p className={`feedback ${feedback.ok ? "ok" : "err"}`}>
                  {feedback.message}
                </p>
              ) : null}

              <div className="step-actions">
                <button className="btn secondary hint-btn" onClick={handleRevealHint}>
                  {hintOpen ? "Hint revealed" : "Hint (−20 pts)"}
                </button>
                {step.kind === "choice" ? (
                  <button
                    className="btn"
                    onClick={handleSubmit}
                    disabled={selected === null}
                  >
                    Submit
                  </button>
                ) : null}
              </div>

              {hintOpen ? <div className="hint-box">💡 {step.hint}</div> : null}
            </section>
          )}
        </div>

        <aside className="room-side">
          <div className="card side-card">
            <p className="eyebrow">ROOM SCORE</p>
            <div className="side-score">
              <strong>{score}</strong>
              <span>/{room.points + 25} max</span>
            </div>

            <div className="side-rows">
              <div className="side-row">
                <span>Hints used</span>
                <b>{hints}</b>
              </div>
              <div className="side-row">
                <span>Failed attempts</span>
                <b>{attempts}</b>
              </div>
              <div className="side-row">
                <span>Penalty per hint</span>
                <b>−20</b>
              </div>
              <div className="side-row">
                <span>No-hint bonus</span>
                <b>+25</b>
              </div>
            </div>
          </div>

          <div className="card side-card">
            <p className="eyebrow">WHY A CHAIN?</p>
            <p className="muted">
              No vulnerability explodes alone. Each link compounds the last —
              this room is one complete attack chain, the way real hackers think.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
