import { Link } from "react-router-dom";

import rooms from "../data/rooms";
import { useProgress } from "../context/progress";
import {
  avgScore,
  computeRoomScore,
  earnedBadges,
  rankFor,
  totalPoints,
} from "../utils/scoring";

function formatTime(sec) {
  if (!sec && sec !== 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function analyse(room, progress) {
  const r = progress.rooms[room.id];
  const max = room.points + 25;
  const score = computeRoomScore(room, progress);
  const pct = Math.round((score / max) * 100);
  const hints = Object.values(r?.hints || {}).reduce((a, b) => a + b, 0);
  const attempts = Object.values(r?.attempts || {}).reduce((a, b) => a + b, 0);

  let verdict;
  let level;
  if (!r) {
    verdict = "Not attempted";
    level = "pending";
  } else if (r.status !== "completed") {
    verdict = "In progress";
    level = "pending";
  } else if (pct >= 90 && hints === 0) {
    verdict = "Excellent — clean chain solve";
    level = "good";
  } else if (pct >= 70) {
    verdict = "Good";
    level = "ok";
  } else {
    verdict = "Needs practice";
    level = "weak";
  }

  return { r, score, max, pct, hints, attempts, verdict, level };
}

export default function Report() {
  const { progress } = useProgress();
  const points = totalPoints(rooms, progress);
  const rank = rankFor(points, rooms);
  const avg = avgScore(rooms, progress);
  const badges = earnedBadges(rooms, progress);
  const rows = rooms.map((room) => analyse(room, progress));

  const strengths = [];
  const weaknesses = [];

  rows.forEach((row, i) => {
    const room = rooms[i];
    if (row.level === "good" && row.hints <= 1) {
      strengths.push({
        room,
        text: `You aced ${room.category} (${room.title}) — solved the chain with ${row.hints} hint${row.hints === 1 ? "" : "s"} and only ${row.attempts} failed attempt${row.attempts === 1 ? "" : "s"}.`,
      });
    }
    if (row.hints >= 2) {
      weaknesses.push({
        room,
        text: `You leaned heavily on hints in ${room.title} (${row.hints} hints). Train your reconnaissance before reaching for help.`,
      });
    }
    if (row.attempts >= 4) {
      weaknesses.push({
        room,
        text: `Multiple failed attempts in ${room.title} (${row.attempts}). Slow down and read the scenario output before guessing.`,
      });
    }
    if (row.level === "pending" && !row.r) {
      weaknesses.push({
        room,
        text: `You haven't started ${room.title}. Starting it unlocks a full OWASP + CVSS + CVE analysis.`,
      });
    }
  });

  if (strengths.length === 0) {
    strengths.push({
      room: null,
      text: "No room mastered cleanly yet. Finish a chain with zero hints and no failed attempts to prove your skill.",
    });
  }

  const download = () => {
    const lines = [];
    lines.push("# Cyber Wolf Chain — Security Learning Report");
    lines.push("");
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push("## Overall");
    lines.push(`- Total points: ${points}`);
    lines.push(`- Rank: ${rank.name}`);
    lines.push(`- Average score: ${avg}%`);
    lines.push(`- Badges earned: ${badges.length}`);
    lines.push("");
    lines.push("## Rooms");
    rows.forEach((row, i) => {
      const room = rooms[i];
      lines.push(`### ${room.title} — ${row.verdict}`);
      lines.push(`- OWASP: ${room.owasp.code} ${room.owasp.name} (#${room.owasp.rank})`);
      lines.push(`- CVSS: ${room.cvss.score} (${room.cvss.severity}) ${room.cvss.vector}`);
      lines.push(`- Score: ${row.score}/${row.max}`);
      lines.push(`- Time: ${formatTime(row.r?.timeSec)}`);
      lines.push(`- Hints: ${row.hints}`);
      lines.push(`- Failed attempts: ${row.attempts}`);
      lines.push(`- CVEs: ${room.cves.map((c) => c.id).join(", ")}`);
      lines.push("");
    });
    lines.push("## Strengths");
    strengths.forEach((s) => lines.push(`- ${s.text}`));
    lines.push("");
    lines.push("## Areas to improve");
    weaknesses.forEach((w) => lines.push(`- ${w.text}`));
    lines.push("");
    lines.push(`Chain impact: ${rooms.map((r) => r.category).join(" + ")}`);

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "security-learning-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="page">
      <header className="dash-head">
        <p className="eyebrow">ADVANCED ACTIVITY ANALYSIS</p>
        <h2 className="section-title">Challenge Report</h2>
        <p className="muted">
          Built from your real activity — hints, attempts, speed and clean solves.
        </p>
      </header>

      <section className="report-overview card">
        <div className="report-stats">
          <div className="stat">
            <span>Total Points</span>
            <strong>{points}</strong>
          </div>
          <div className="stat">
            <span>Rank</span>
            <strong>{rank.name}</strong>
          </div>
          <div className="stat">
            <span>Avg Score</span>
            <strong>{avg}%</strong>
          </div>
          <div className="stat">
            <span>Badges</span>
            <strong>{badges.length}</strong>
          </div>
        </div>
        <button className="btn" onClick={download}>
          Download Report (.md)
        </button>
      </section>

      <section className="report-table card">
        <p className="eyebrow">PER-ROOM BREAKDOWN</p>
        <div className="rep-head">
          <span>Room</span>
          <span>OWASP</span>
          <span>Score</span>
          <span>Time</span>
          <span>Hints</span>
          <span>Attempts</span>
          <span>Verdict</span>
        </div>
        {rows.map((row, i) => {
          const room = rooms[i];
          return (
            <div className="rep-row" key={room.id}>
              <Link to={`/room/${room.id}`} className="rep-room">
                {room.title}
              </Link>
              <span className="rep-owasp">
                {room.owasp.code}
                <small className="muted">#{room.owasp.rank}</small>
              </span>
              <span>
                <b>{row.score}</b>
                <small className="muted">/{row.max}</small>
              </span>
              <span>{formatTime(row.r?.timeSec)}</span>
              <span>{row.hints}</span>
              <span>{row.attempts}</span>
              <span className={`verdict ${row.level}`}>{row.verdict}</span>
            </div>
          );
        })}
      </section>

      <div className="report-duo">
        <section className="card report-col good">
          <p className="eyebrow">YOUR STRENGTHS</p>
          {strengths.map((s, i) => (
            <div className="report-bullet" key={i}>
              <span className="check-mark">✓</span>
              {s.text}
            </div>
          ))}
        </section>

        <section className="card report-col weak">
          <p className="eyebrow">WHERE TO IMPROVE</p>
          {weaknesses.length === 0 ? (
            <div className="report-bullet">
              <span className="check-mark">✓</span>
              No weak spots detected. Keep hunting.
            </div>
          ) : (
            weaknesses.map((w, i) => (
              <div className="report-bullet" key={i}>
                <span className="cross-mark">✕</span>
                {w.text}
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
