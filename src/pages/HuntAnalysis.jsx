import { Link, Navigate, useParams } from "react-router-dom";

import { findPlayground } from "../data/playgrounds";
import { useHunt } from "../context/hunt";
import { useAuth } from "../context/auth";
import { parseVector } from "../utils/cvss";
import { generateHuntReport } from "../utils/pdf";

function CveCard({ cve }) {
  return (
    <div className="cve-card">
      <div className="cve-head">
        <span className="cve-id">{cve.id}</span>
        <span className="cve-score">{cve.score}/10</span>
      </div>
      <b>{cve.name}</b>
      <p className="muted">{cve.desc}</p>
    </div>
  );
}

export default function HuntAnalysis() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isPlaygroundComplete, capturedForPlayground } = useHunt();

  const playground = findPlayground(id);
  if (!playground) return <Navigate to="/playgrounds" replace />;

  if (!isPlaygroundComplete(playground)) {
    return (
      <main className="page">
        <header className="dash-head">
          <Link to={`/playgrounds/${playground.id}`} className="muted">
            ← Back to {playground.name}
          </Link>
          <p className="eyebrow">LOCKED · 🔒</p>
          <h2 className="section-title">Post-breach report is sealed</h2>
          <p className="muted">
            This app's professional report unlocks when you confirm every
            vulnerability in <b>{playground.name}</b>. You currently have{" "}
            {capturedForPlayground(playground).length} of{" "}
            {playground.apps.length} findings confirmed.
          </p>
        </header>
      </main>
    );
  }

  const handleReport = () => generateHuntReport(playground, user || null);

  return (
    <main className="page">
      <header className="dash-head">
        <Link to={`/playgrounds/${playground.id}`} className="muted">
          ← Back to {playground.name}
        </Link>
        <p className="eyebrow">
          {playground.emoji} POST-BREACH REPORT · {playground.theme}
        </p>
        <h2 className="section-title">
          {playground.name} — penetration test report
        </h2>
        <p className="muted">
          You broke the chain. This professional report documents the findings,
          the CVSS severity, and exactly what secure teams do to stop it — or
          download it as a PDF.
        </p>
      </header>

      <button className="btn download-btn" onClick={handleReport}>
        ⬇️ Download PDF report
      </button>

      <section className="card analysis-card">
        <p className="eyebrow">THE STORY</p>
        <p>{playground.story}</p>
        {playground.supplyChainNote ? (
          <div className="supply-chain-note">
            <p className="eyebrow">⛓️ THE SUPPLY-CHAIN ANGLE</p>
            <p>{playground.supplyChainNote}</p>
          </div>
        ) : null}
      </section>

      <section className="card analysis-card">
        <p className="eyebrow">STEP BY STEP</p>
        <ol className="attack-chain">
          {playground.chain.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="card analysis-card">
        <p className="eyebrow">THE VULNERABILITIES</p>
        <div className="analysis-list">
          {playground.apps.map((app) => (
            <div key={app.id} className="analysis-item">
              <b>{app.name}</b>
              <span className="muted">{app.category}</span>
              <p className="muted">Goal you completed: {app.goal}</p>
              <p>🛠️ How to fix it: {app.learn}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card analysis-card">
        <p className="eyebrow">CVSS ASSESSMENT</p>
        <div className="cvss-score-line">
          <strong>{playground.cvss.score}</strong>
          <span className="cvss-severity">{playground.cvss.severity}</span>
          <code>{playground.cvss.vector}</code>
        </div>
        <div className="cvss-metrics">
          {parseVector(playground.cvss.vector).map((m) => (
            <span key={m.key} className="cvss-metric">
              <i>{m.label}</i>
              {m.value}
            </span>
          ))}
        </div>
        <p className="muted">
          CVSS grades severity from 0–10. Attack Vector says how the attacker
          reaches the flaw, Complexity how hard it is to exploit, Privileges
          Required what access is needed first, User Interaction whether a
          victim must click, Scope whether damage crosses a trust boundary, and
          C/I/A how badly confidentiality, integrity and availability are hurt.
        </p>
      </section>

      <section className="card analysis-card">
        <p className="eyebrow">REAL-WORLD CVEs BEHIND THIS WORLD</p>
        <div className="cve-grid">
          {playground.cves.map((cve) => (
            <CveCard key={cve.id} cve={cve} />
          ))}
        </div>
      </section>

      <section className="card analysis-card">
        <p className="eyebrow">SECURE CODING CHECKLIST</p>
        <ul className="secure-checklist">
          {playground.practices.map((item, i) => (
            <li key={i}>
              <span className="check">☐</span> {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
