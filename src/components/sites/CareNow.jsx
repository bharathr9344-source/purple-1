import { useState } from "react";

import { BrowserChrome, Shell } from "../SimBrowser";

const RECORDS = {
  2001: { name: "You", diag: "Seasonal flu", meds: "Paracetamol 500mg", note: "Follow-up in 2 weeks." },
  2002: { name: "Priya Nair", diag: "Chest x-ray pending", meds: "—", note: "Psych eval requested by HR. FLAG{p4t13nt_0v3rl00k}" },
  2003: { name: "Marcus Reed", diag: "Allergic rhinitis", meds: "Cetirizine 10mg", note: "Review in 3 months." },
  2004: { name: "Elena Rossi", diag: "Pre-op screening", meds: "—", note: "Cardiology consult." },
};

function RecordsPage({ onReveal }) {
  const [id, setId] = useState("2001");
  const [err, setErr] = useState(false);

  const open = (rid) => {
    setId(rid);
    setErr(!RECORDS[rid]);
    if (rid === "2002") onReveal();
  };

  const rec = RECORDS[id];

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Patient records</h4>
        <span className="sim-muted">carenow.app/records?id=…</span>
      </div>
      {err || !rec ? (
        <div className="sim-alert err">Record not found.</div>
      ) : (
        <div className="sim-invoice">
          <h4>Patient record #{id} · {rec.name}</h4>
          <p className="sim-note"><b>Diagnosis:</b> {rec.diag}</p>
          <p className="sim-note"><b>Medication:</b> {rec.meds}</p>
          <p className="sim-note"><b>Doctor's notes:</b> {rec.note}</p>
        </div>
      )}
      <div className="sim-form sim-inline-form">
        <label className="sim-muted">Open record #</label>
        <input
          className="sim-field"
          type="number"
          value={id}
          onChange={(e) => open(e.target.value)}
        />
      </div>
      <p className="sim-muted sim-hint">
        Record ids are sequential and the portal never checks who you are —
        yours is 2001, try 2002.
      </p>
    </div>
  );
}

function AppointmentsPage({ onReveal }) {
  const [note, setNote] = useState("");
  const [list, setList] = useState([
    { id: 1, doctor: "Dr. Lee", date: "12 Aug", note: "Routine checkup — all good." },
  ]);
  const [status, setStatus] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setList((l) => [...l, { id: Date.now(), doctor: "Dr. Sharma", date: "14 Aug", note }]);
    if (/<script/i.test(note)) {
      setStatus({ ok: true, evil: true, text: "Appointment saved. Your note runs as script in the doctor's browser!" });
      onReveal();
    } else {
      setStatus({ ok: true, evil: false, text: "Appointment booked with Dr. Sharma." });
    }
    setNote("");
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Appointments</h4>
        <span className="sim-muted">Notes are rendered as raw HTML for staff</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <h4>Book an appointment</h4>
        <textarea
          className="sim-field sim-area"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason for visit…"
          rows="3"
        />
        <button type="submit" className="sim-button">Book appointment</button>
        {status ? (
          <div className={`sim-alert ${status.evil ? "err" : "ok"}`}>{status.text}</div>
        ) : null}
      </form>

      <div className="vibe-comments">
        {list.map((a) => (
          <div className="vibe-comment" key={a.id}>
            <b>{a.doctor} · {a.date}</b>
            <p>{a.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WelcomePage({ onReveal }) {
  const [hash, setHash] = useState("welcome");
  const [greeting, setGreeting] = useState("Welcome, patient 2001.");
  const [status, setStatus] = useState(null);

  const apply = (e) => {
    e.preventDefault();
    setGreeting(`Welcome, ${hash || "patient 2001"}.`);
    if (/<script|onerror=/.test(hash)) {
      setStatus({
        ok: true,
        evil: true,
        text: "alert('PHI leak') ran in your browser — the value from the URL hash was written with innerHTML. FLAG{d0m_xss_p0rtal}",
      });
      onReveal();
    } else {
      setStatus({ ok: true, evil: false, text: "Portal banner updated." });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Portal welcome banner</h4>
        <span className="sim-muted">carenow.app/portal/#…</span>
      </div>
      <div className="sim-alert ok">{greeting}</div>
      <form className="sim-form" onSubmit={apply}>
        <h4>Set banner from URL fragment</h4>
        <input
          className="sim-field"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          placeholder='welcome or <img src=x onerror=alert(1)>'
        />
        <button type="submit" className="sim-button">Render</button>
      </form>
      {status ? (
        <div className={`sim-alert ${status.evil ? "err" : "ok"}`}>{status.text}</div>
      ) : null}
      <p className="sim-muted sim-hint">
        The value never reaches the server — it's read from the URL and written
        with innerHTML. DOM-based XSS.
      </p>
    </div>
  );
}

function PortalHome({ onNavigate }) {
  return (
    <div>
      <div className="sim-hello">
        <p className="eyebrow">CARENOW CLINIC · PATIENT PORTAL</p>
        <h3>Good morning, patient 2001</h3>
        <p className="sim-muted">
          Book appointments, view your records, and message your care team.
        </p>
      </div>
      <div className="sim-stat-grid">
        <div className="sim-stat">
          <p className="sim-side-title">Upcoming appointments</p>
          <table className="sim-table">
            <tbody>
              <tr><td>14 Aug · 09:30</td><td>Dr. Sharma · General</td></tr>
              <tr><td>21 Aug · 11:00</td><td>Dr. Lee · Follow-up</td></tr>
            </tbody>
          </table>
        </div>
        <div className="sim-stat card-promo">
          <p className="eyebrow">SECURITY NOTICE</p>
          <p className="sim-muted">
            Our portal lets you view records by number. Some patients found
            other records — we're "investigating".
          </p>
          <button className="sim-button ghost" onClick={() => onNavigate("records")}>
            Open my records →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CareNow({ onReveal }) {
  const [raw, setRaw] = useState("https://carenow.app/portal");
  const [path, setPath] = useState("/portal");

  const reveal = (id, flag) => onReveal(id, flag);

  const navigate = (url) => {
    let u;
    try {
      u = new URL(url);
    } catch {
      setPath("/404");
      setRaw(url);
      return;
    }
    setRaw(u.href);
    setPath(u.pathname.startsWith("/") ? u.pathname : `/${u.pathname}`);
  };

  const page = path.split("/")[1] || "portal";

  return (
    <Shell>
      <BrowserChrome url={raw} onNavigate={navigate} editable />
      <div className="sim-site health health-site">
        <header className="sim-site-head">
          <span className="sim-logo">🏥 CareNow Clinic</span>
          <nav className="sim-nav">
            {[
              ["portal", "Portal"],
              ["records", "Records"],
              ["appointments", "Appointments"],
              ["welcome", "Banner"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={page === id ? "on" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`https://carenow.app/${id}`);
                }}
              >
                {label}
              </a>
            ))}
          </nav>
          <span className="sim-user">patient_portal</span>
        </header>

        <div className="sim-body">
          <div className="sim-main">
            {page === "portal" ? (
              <PortalHome onNavigate={(p) => navigate(`https://carenow.app/${p}`)} />
            ) : null}
            {page === "records" ? (
              <RecordsPage onReveal={() => reveal("health-records", "FLAG{p4t13nt_0v3rl00k}")} />
            ) : null}
            {page === "appointments" ? (
              <AppointmentsPage onReveal={() => reveal("health-xss", "FLAG{xss1n_cl1n1c}")} />
            ) : null}
            {page === "welcome" ? (
              <WelcomePage onReveal={() => reveal("health-dom", "FLAG{d0m_xss_p0rtal}")} />
            ) : null}
            {!["portal", "records", "appointments", "welcome"].includes(page) ? (
              <div className="sim-alert err">404 — {path} not found.</div>
            ) : null}
          </div>
        </div>

        <footer className="sim-footer">
          © 2025 CareNow Clinic — Simulated portal; no real patient data exists.
        </footer>
      </div>
    </Shell>
  );
}
