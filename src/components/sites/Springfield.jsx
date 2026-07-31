import { useState } from "react";

import { BrowserChrome, Shell } from "../SimBrowser";

const FEES = [
  { id: 1, student: "Alice Okafor (Grade 9)", fee: "120.00", status: "paid" },
  { id: 2, student: "Priya Nair (Grade 12)", fee: "540.00", status: "overdue" },
  { id: 3, student: "Marcus Reed (Grade 11)", fee: "300.00", status: "paid" },
];

function LoginPage({ onReveal }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [board, setBoard] = useState(false);
  const [status, setStatus] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (user === "staff_john" && pass === "Summer2024!") {
      setStatus({ ok: true, staff: true, text: "Welcome, staff_john (Staff). You're in." });
      onReveal();
    } else if (user === "alice" && pass === "student123") {
      setStatus({ ok: true, staff: false, text: "Welcome, alice (Student)." });
    } else {
      setStatus({ ok: false, text: "Invalid username or password." });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Student / Staff login</h4>
        <span className="sim-muted">springfield.edu/portal/login</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <label className="sim-muted">Username</label>
        <input
          className="sim-field"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="username"
          autoComplete="off"
        />
        <label className="sim-muted">Password</label>
        <input
          className="sim-field"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="password"
          autoComplete="off"
        />
        <button type="submit" className="sim-button">Sign in</button>
        {status ? (
          <div className={`sim-alert ${status.ok ? "ok" : "err"}`}>{status.text}</div>
        ) : null}
      </form>

      <button className="learn-toggle" onClick={() => setBoard((b) => !b)}>
        <span>{board ? "▾" : "▸"}</span>
        Forgot password? Staff resets are posted on the message board
      </button>
      {board ? (
        <div className="sim-log warn">
          <pre>{`[IT Dept] Password reset
User:    staff_john
Temp:    Summer2024!
"Change it on first login!"`}</pre>
        </div>
      ) : null}
    </div>
  );
}

function DbConsolePage({ onReveal }) {
  const [sql, setSql] = useState("");
  const [out, setOut] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (/fees|select|admin/i.test(sql)) {
      setOut([
        "+----+--------------+--------+------------+",
        "| id | student      | fee    | status     |",
        "+----+--------------+--------+------------+",
        "| 1  | alice        | 120.00 | paid       |",
        "| 2  | priya        | 540.00 | overdue    |",
        "| 3  | marcus       | 300.00 | paid       |",
        "| SYS| db_console   | ⚠ read | no authz   |",
        "|    | FLAG{db_n0_authz}                     |",
        "+----+--------------+--------+------------+",
      ]);
      onReveal();
    } else {
      setOut(["Query executed: 0 rows returned."]);
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Database console (beta)</h4>
        <span className="sim-muted">Staff tools · signed in as staff_john</span>
      </div>
      <p className="sim-muted">
        The attendance plugin exposed its database console to staff. It runs any
        SQL you type.
      </p>
      <form className="sim-form" onSubmit={submit}>
        <div className="sim-search-row">
          <input
            className="sim-field"
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="SELECT * FROM fees"
            spellCheck="false"
            autoComplete="off"
          />
          <button type="submit" className="sim-button">Run</button>
        </div>
      </form>
      {out ? (
        <div className="sim-log bad">
          {out.map((line, i) => (
            <pre key={i}>{line}</pre>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FeesPage({ onReveal }) {
  const [student, setStudent] = useState("You (Grade 9)");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (!amount) return;
    setStatus({
      ok: true,
      tampered: student !== "You (Grade 9)",
      text: `Fee record updated for ${student}: $${amount} → saved to school.db`,
    });
    if (student !== "You (Grade 9)") onReveal();
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Fee records</h4>
        <span className="sim-muted">Billing system · no role checks</span>
      </div>
      <table className="sim-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Fee</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {FEES.map((f) => (
            <tr key={f.id}>
              <td>{f.student}</td>
              <td>${f.fee}</td>
              <td>{f.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form className="sim-form" onSubmit={submit}>
        <h4>Update a fee</h4>
        <label className="sim-muted">Student</label>
        <select
          className="sim-field"
          value={student}
          onChange={(e) => setStudent(e.target.value)}
        >
          {["You (Grade 9)", "Priya Nair (Grade 12)", "Marcus Reed (Grade 11)"].map(
            (s) => (
              <option key={s}>{s}</option>
            )
          )}
        </select>
        <label className="sim-muted">New fee amount ($)</label>
        <input
          className="sim-field"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
        <button type="submit" className="sim-button">Save fee</button>
        {status ? (
          <div className={`sim-alert ${status.tampered ? "err" : "ok"}`}>
            {status.text}
          </div>
        ) : null}
      </form>
    </div>
  );
}

function RegisterPage({ onReveal }) {
  const [extra, setExtra] = useState("");
  const [status, setStatus] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (extra.includes("role") && extra.includes("admin")) {
      setStatus({
        ok: true,
        evil: true,
        text: "Account created with role=admin! You can now open /staff/console. FLAG{m4ss_4ss1gn}",
      });
      onReveal();
    } else {
      setStatus({ ok: true, evil: false, text: "Student account created. You are role=student." });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Create student account</h4>
        <span className="sim-muted">springfield.edu/portal/register</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <label className="sim-muted">Full name</label>
        <input className="sim-field" readOnly value="Johnny Sparks" />
        <label className="sim-muted">Email</label>
        <input className="sim-field" readOnly value="js@student.edu" />
        <label className="sim-muted">Extra form fields (sent by your browser)</label>
        <input
          className="sim-field sim-mono"
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder='{"role":"admin"}'
          spellCheck="false"
        />
        <button type="submit" className="sim-button">Register</button>
      </form>
      {status ? (
        <div className={`sim-alert ${status.evil ? "err" : "ok"}`}>{status.text}</div>
      ) : null}
      <p className="sim-muted sim-hint">
        The backend binds every submitted field straight onto the account
        object — whatever you add, it sets.
      </p>
    </div>
  );
}

function PortalHome({ onNavigate }) {
  return (
    <div>
      <div className="sim-hello">
        <p className="eyebrow">SPRINGFIELD HIGH · STUDENT PORTAL</p>
        <h3>Good morning, Alice</h3>
        <p className="sim-muted">
          One stop for attendance, fees, and announcements — powered by the
          district's third-party attendance plugin.
        </p>
      </div>
      <div className="sim-stat-grid">
        <div className="sim-stat">
          <p className="sim-side-title">Today's classes</p>
          <table className="sim-table">
            <tbody>
              <tr><td>08:00</td><td>Math · Room 204</td></tr>
              <tr><td>09:30</td><td>Physics · Lab 3</td></tr>
              <tr><td>11:00</td><td>History · Room 110</td></tr>
            </tbody>
          </table>
        </div>
        <div className="sim-stat card-promo">
          <p className="eyebrow">MESSAGE BOARD</p>
          <p className="sim-muted">
            [IT Dept] Staff password resets are now posted here for convenience.
          </p>
          <button
            className="sim-button ghost"
            onClick={() => onNavigate("login")}
          >
            Go to login →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Springfield({ onReveal }) {
  const [raw, setRaw] = useState("https://springfield.edu/portal");
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
      <div className="sim-site school school-site">
        <header className="sim-site-head">
          <span className="sim-logo">🏫 Springfield High Portal</span>
          <nav className="sim-nav">
            {[
              ["portal", "Portal"],
              ["login", "Login"],
              ["db", "Staff DB"],
              ["fees", "Fees"],
              ["register", "Register"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={page === id ? "on" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`https://springfield.edu/${id}`);
                }}
              >
                {label}
              </a>
            ))}
          </nav>
          <span className="sim-user">alice (student)</span>
        </header>

        <div className="sim-body">
          <div className="sim-main">
            {page === "portal" ? <PortalHome onNavigate={(p) => navigate(`https://springfield.edu/${p}`)} /> : null}
            {page === "login" ? (
              <LoginPage onReveal={() => reveal("school-login", "FLAG{st4ff_1nt3rn4l_4cc}")} />
            ) : null}
            {page === "db" ? (
              <DbConsolePage onReveal={() => reveal("school-db", "FLAG{db_n0_authz}")} />
            ) : null}
            {page === "fees" ? (
              <FeesPage onReveal={() => reveal("school-fees", "FLAG{f33_74mp3r1ng}")} />
            ) : null}
            {page === "register" ? (
              <RegisterPage onReveal={() => reveal("school-mass", "FLAG{m4ss_4ss1gn}")} />
            ) : null}
            {!["portal", "login", "db", "fees", "register"].includes(page) ? (
              <div className="sim-alert err">404 — {path} not found.</div>
            ) : null}
          </div>
        </div>

        <footer className="sim-footer">
          © 2025 Springfield School District — Simulated portal, nothing leaves
          your browser.
        </footer>
      </div>
    </Shell>
  );
}
