import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import rooms from "../data/rooms";
import { useProgress } from "../context/progress";

export default function AttackChain() {
  const { roomId } = useParams();
  const room = rooms.find((r) => r.id === roomId);
  const { getRoom } = useProgress();
  const [selected, setSelected] = useState(0);

  if (!room) return <Navigate to="/" replace />;

  const r = getRoom(room.id);
  const steps = room.steps;
  const H = 150;
  const totalH = (steps.length + 1) * H + 40;
  const cx = 360;

  return (
    <main className="page">
      <div className="breadcrumb">
        <Link to="/">Rooms</Link>
        <span>/</span>
        <Link to={`/room/${room.id}`}>{room.title}</Link>
        <span>/</span>
        <span>Attack Chain</span>
      </div>

      <header className="card chain-head">
        <p className="eyebrow">ATTACK CHAIN GRAPH</p>
        <h2 className="section-title">{room.chainTitle}</h2>
        <p className="muted">
          Every node is a step real attackers take. Click a node to see why it
          happened, what mistake caused it, and how it's exploited in the wild.
        </p>
      </header>

      <div className="room-tabs">
        <Link to={`/room/${room.id}`} className="room-tab">
          Lab
        </Link>
        <Link to={`/room/${room.id}/chain`} className="room-tab active">
          Attack Chain
        </Link>
        <Link to={`/room/${room.id}/analysis`} className="room-tab">
          Analysis
        </Link>
      </div>

      <div className="chain-layout">
        <div className="chain-canvas" style={{ height: totalH }}>
          <svg
            className="chain-svg"
            viewBox={`0 0 720 ${totalH}`}
            preserveAspectRatio="xMidYMin meet"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" className="chain-arrow" />
              </marker>
            </defs>
            {steps.map((_, i) => {
              const y1 = 30 + i * H + 120;
              const y2 = 30 + (i + 1) * H;
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={y1}
                  x2={cx}
                  y2={y2}
                  className="chain-link"
                  markerEnd="url(#arrow)"
                />
              );
            })}
            <line
              x1={cx}
              y1={30 + steps.length * H + 120}
              x2={cx}
              y2={30 + (steps.length + 1) * H}
              className="chain-link"
              markerEnd="url(#arrow)"
            />
          </svg>

          {steps.map((step, i) => {
            const solved = r.stepsSolved.includes(step.id);
            return (
              <button
                key={step.id}
                className={`chain-node ${solved ? "solved" : ""} ${
                  selected === i ? "selected" : ""
                }`}
                style={{ top: 30 + i * H }}
                onClick={() => setSelected(i)}
              >
                <span className="chain-node-no">STEP {i + 1}</span>
                <span className="chain-node-title">{step.title}</span>
              </button>
            );
          })}

          <div
            className="chain-node impact-node"
            style={{ top: 30 + steps.length * H }}
          >
            <span className="chain-node-no">CHAIN IMPACT</span>
            <span className="chain-node-title">{room.category}</span>
          </div>
        </div>

        <aside className="card chain-detail">
          <p className="eyebrow">
            STEP {selected + 1} · {steps[selected].title.toUpperCase()}
          </p>
          <h3>{steps[selected].title}</h3>

          <div className="teach-grid">
            <div className="teach-box bad">
              <span>Why this step happened</span>
              <p>{steps[selected].teach}</p>
            </div>
            <div className="teach-box">
              <span>What mistake caused it</span>
              <p>{steps[selected].mistake}</p>
            </div>
            <div className="teach-box">
              <span>How attackers use it</span>
              <p>{steps[selected].teach}</p>
            </div>
          </div>

          <div className="chain-story">
            <span className="chain-story-label">THE FULL CHAIN</span>
            <p className="muted">
              {steps.map((s) => s.title.split(": ").pop()).join(" → ")} →{" "}
              {room.category}
            </p>
          </div>

          <Link to={`/room/${room.id}/analysis`} className="btn">
            See OWASP + CVSS Analysis
          </Link>
        </aside>
      </div>
    </main>
  );
}
