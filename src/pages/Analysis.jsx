import { Link, Navigate, useParams } from "react-router-dom";

import rooms from "../data/rooms";

const OWASP_2025 = [
  { code: "A01:2025", name: "Broken Access Control" },
  { code: "A02:2025", name: "Security Misconfiguration" },
  { code: "A03:2025", name: "Software Supply Chain Failures" },
  { code: "A04:2025", name: "Cryptographic Failures" },
  { code: "A05:2025", name: "Injection" },
  { code: "A06:2025", name: "Insecure Design" },
  { code: "A07:2025", name: "Authentication Failures" },
  { code: "A08:2025", name: "Software / Data Integrity Failures" },
  { code: "A09:2025", name: "Security Logging & Alerting Failures" },
  { code: "A10:2025", name: "Mishandling of Exceptional Conditions" },
];

export default function Analysis() {
  const { roomId } = useParams();
  const room = rooms.find((r) => r.id === roomId);

  if (!room) return <Navigate to="/" replace />;

  const { owasp, cvss, cves, prevention, cwe } = room;
  const pct = Math.round((cvss.score / 10) * 100);
  const color = cvss.score >= 9 ? "var(--bad)" : cvss.score >= 7 ? "var(--warn)" : "var(--good)";

  return (
    <main className="page">
      <div className="breadcrumb">
        <Link to="/">Rooms</Link>
        <span>/</span>
        <Link to={`/room/${room.id}`}>{room.title}</Link>
        <span>/</span>
        <span>Analysis</span>
      </div>

      <div className="room-tabs">
        <Link to={`/room/${room.id}`} className="room-tab">
          Lab
        </Link>
        <Link to={`/room/${room.id}/chain`} className="room-tab">
          Attack Chain
        </Link>
        <Link to={`/room/${room.id}/analysis`} className="room-tab active">
          Analysis
        </Link>
      </div>

      <header className="card analysis-head">
        <p className="eyebrow">SECURITY ANALYSIS</p>
        <h2 className="section-title">{room.title}</h2>
        <p className="muted">{room.story}</p>
      </header>

      <section className="analysis-grid">
        <div className="card owasp-card">
          <p className="eyebrow">OWASP TOP 10: 2025</p>
          <div className="owasp-rank">
            <span className="owasp-big">#{owasp.rank}</span>
            <div>
              <h3>{owasp.name}</h3>
              <p className="muted">
                {owasp.code} · {cwe}
              </p>
            </div>
          </div>
          <p className="muted">{owasp.desc}</p>

          <div className="top10-list">
            {OWASP_2025.map((item, i) => (
              <div
                key={item.code}
                className={`top10-row ${item.code === owasp.code ? "hit" : ""}`}
              >
                <span className="top10-no">{i + 1}</span>
                <span className="top10-name">{item.name}</span>
                {item.code === owasp.code ? <b className="top10-you">YOUR LAB</b> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="card cvss-card">
          <p className="eyebrow">CVSS IMPACT SCORE</p>
          <div className="cvss-top">
            <div
              className="score-ring"
              style={{
                background: `conic-gradient(${color} ${pct * 3.6}deg, rgba(30,7,83,0.08) 0deg)`,
              }}
            >
              <div className="score-ring-inner">
                <strong>{cvss.score}</strong>
                <span>/ 10</span>
              </div>
            </div>
            <div>
              <span className={`pill ${cvss.severity.toLowerCase()}`}>
                {cvss.severity}
              </span>
              <p className="muted vector-string">{cvss.vector}</p>
            </div>
          </div>

          <div className="cvss-table">
            {cvss.breakdown.map((row) => (
              <div className="cvss-row" key={row.key}>
                <span className="cvss-key">{row.key}</span>
                <div>
                  <b>{row.label}</b>
                  <small className="muted">{row.note}</small>
                </div>
                <span className="cvss-value">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card cves-card">
        <p className="eyebrow">REAL-WORLD CVEs</p>
        <h3>Same vulnerability class, exploited in the wild</h3>
        <div className="cve-list">
          {cves.map((cve) => (
            <div className="cve-item" key={cve.id}>
              <div className="cve-top">
                <b>{cve.id}</b>
                <span className={`pill ${Number(cve.score) >= 9 ? "critical" : "high"}`}>
                  {cve.score}
                </span>
              </div>
              <p className="muted">{cve.name}</p>
              <p className="muted">{cve.desc}</p>
              <span className="cve-vector muted">{cve.vector}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="prevention-section">
        <div className="card code-card bad-code">
          <p className="eyebrow">VULNERABLE CODE</p>
          <pre>{prevention.vulnerableCode}</pre>
        </div>

        <div className="card code-card good-code">
          <p className="eyebrow">SECURE CODE</p>
          <pre>{prevention.secureCode}</pre>
        </div>
      </section>

      <section className="card checklist-card">
        <p className="eyebrow">PREVENTION CHECKLIST</p>
        <div className="checklist">
          {prevention.checklist.map((item) => (
            <div className="check-item" key={item}>
              <span className="check-mark">✓</span>
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
