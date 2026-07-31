import { Link } from "react-router-dom";

import { playgrounds } from "../data/playgrounds";
import { useHunt } from "../context/hunt";
import { useAuth } from "../context/auth";

export default function PlaygroundHub() {
  const { userId } = useAuth();
  const { totalFlags, totalChallenges, playgroundProgress, isPlaygroundComplete } =
    useHunt();

  return (
    <main className="page">
      <header className="dash-head">
        <p className="eyebrow">EXPLORER PATH · HUNT MODE</p>
        <h2 className="section-title">The Cyber Wolf Playgrounds</h2>
        <p className="muted">
          Six real-looking apps built from real-world breaches — a school
          portal, a bank, a clinic, the Vulnerable Treasure storefront, an
          OWASP Top 10 corporate portal, and a tea shop whose every module hides
          a flaw, connected by a graph-based attack chain. Each one is a single
          navigable web app hiding multiple vulnerabilities. Wander the pages
          like a pentester, confirm every finding, then open the post-breach
          report.
        </p>
      </header>

      {userId ? (
        <div className="playground-summary">
          <div className="card stat-card">
            <span className="stat-icon">🏴</span>
            <span className="stat-label">Flags Captured</span>
            <strong>
              {totalFlags}/{totalChallenges}
            </strong>
          </div>
          <div className="card stat-card">
            <span className="stat-icon">🎪</span>
            <span className="stat-label">Playgrounds</span>
            <strong>{playgrounds.length}</strong>
          </div>
          <div className="card stat-card">
            <span className="stat-icon">🏁</span>
            <span className="stat-label">Worlds Beaten</span>
            <strong>{isPlaygroundComplete.length > 0 ? isPlaygroundComplete.length : 0}</strong>
          </div>
        </div>
      ) : (
        <p className="muted">
          <Link to="/login" className="btn ghost">
            Sign in
          </Link>{" "}
          to track your flags across these playgrounds.
        </p>
      )}

      <div className="playground-grid">
        {playgrounds.map((p) => {
          const progress = userId ? playgroundProgress(p) : null;
          return (
            <Link to={`/playgrounds/${p.id}`} key={p.id} className="card playground-card">
              <div className="playground-card-head">
                <span className="playground-emoji">{p.emoji}</span>
                <span className="diff-badge">{p.difficulty}</span>
              </div>
              <p className="eyebrow">{p.theme}</p>
              <h3>{p.name}</h3>
              <p className="muted playground-card-story">{p.story}</p>

              {p.supplyChain ? (
                <p className="supply-chain-tag">⛓️ Supply-chain themed</p>
              ) : null}

              <div className="playground-card-foot">
                {progress ? (
                  <div className="hunt-progress">
                    <div className="hunt-progress-bar">
                      <div
                        className="hunt-progress-fill"
                        style={{ width: `${progress.pct}%` }}
                      />
                    </div>
                    <span className="muted">
                      {progress.done}/{progress.total} findings
                    </span>
                  </div>
                ) : (
                  <span className="muted">{p.apps.length} vulnerabilities</span>
                )}
                <span className="muted">
                  {p.cves.length} CVE{p.cves.length > 1 ? "s" : ""}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
