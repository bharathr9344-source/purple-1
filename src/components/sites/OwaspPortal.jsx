import { useEffect, useState } from "react";

import { useBrowser } from "../browserCtx";
import BrowserFrame from "../BrowserFrame";
import { BrowserChrome } from "../SimBrowser";

const DEFAULT_SESSION = "alice:1";

const sessionUser = (token) => {
  const user = String(token || DEFAULT_SESSION).split(":")[0];
  return user || "guest";
};

const CUSTOMERS = {
  "101": {
    name: "Alice Morgan",
    plan: "Enterprise",
    contact: "alice@owasp-corp.com",
    note: "Primary contact. No restricted data.",
  },
  "102": {
    name: "Priya Sharma",
    plan: "Enterprise",
    contact: "priya@owasp-corp.com",
    note: "Restricted — signed NDA. FLAG{ac1_cust0mer_1d0r}",
  },
  "103": {
    name: "Marcus Webb",
    plan: "Pro",
    contact: "marcus@owasp-corp.com",
    note: "No restricted data.",
  },
};

const EMPLOYEES = [
  {
    name: "Alice Morgan",
    role: "Administrator",
    password: btoa("Admin@123"),
    card: "4532 1111 2222 3333",
  },
  {
    name: "Priya Sharma",
    role: "Finance",
    password: btoa("Summer2024"),
    card: "4916 9999 8888 7777",
  },
  {
    name: "Marcus Webb",
    role: "Support",
    password: btoa("password123"),
    card: "4539 0000 1111 2222",
  },
];

const NAV = [
  {
    group: "Operations",
    items: [
      ["dashboard", "Dashboard", "▦"],
      ["customers", "Customers", "▤"],
      ["payroll", "Payroll", "﹩"],
      ["search", "Search", "⌕"],
    ],
  },
  {
    group: "System",
    items: [
      ["debug", "Debug Console", "⚙"],
      ["components", "Components", "◈"],
      ["updates", "Updates", "⤓"],
      ["proxy", "Proxy", "⇄"],
    ],
  },
  {
    group: "Identity & Trust",
    items: [
      ["session", "Session", "🔑"],
      ["reset", "Password Reset", "🔒"],
      ["security", "Security Center", "⛨"],
    ],
  },
];

const KNOWN_PAGES = NAV.flatMap((g) => g.items.map(([id]) => id));

function Kicker({ code, title }) {
  return (
    <p className="ow-kicker">
      <span className="ow-kicker-code">{code}</span>
      {title}
    </p>
  );
}

function DashboardPage({ onNavigate }) {
  return (
    <div className="ow-page">
      <Kicker code="OWASP" title="Internal Operations Portal" />
      <h2 className="ow-title">Dashboard</h2>
      <p className="ow-sub">Operational overview — all services nominal.</p>

      <div className="ow-cards">
        <div className="ow-card stat">
          <span className="ow-stat-label">Active customers</span>
          <strong className="ow-stat-value">1,204</strong>
        </div>
        <div className="ow-card stat">
          <span className="ow-stat-label">Pending invoices</span>
          <strong className="ow-stat-value">38</strong>
        </div>
        <div className="ow-card stat">
          <span className="ow-stat-label">Servers</span>
          <strong className="ow-stat-value">12</strong>
        </div>
        <div className="ow-card stat">
          <span className="ow-stat-label">Open incidents</span>
          <strong className="ow-stat-value">0</strong>
        </div>
      </div>

      <div className="ow-card">
        <h3 className="ow-card-title">Quick access</h3>
        <p className="ow-muted">
          Every module is one click away. Start with the{" "}
          <b>Customers</b> directory, review <b>Payroll</b>, then work your way
          through the system tools. This is a deliberately insecure sandbox —
          nothing leaves your browser.
        </p>
        <div className="ow-quick">
          {NAV.flatMap((g) => g.items).map(([id, label, icon]) => (
              <button
                key={id}
                className="ow-quick-btn"
                onClick={() => onNavigate(`https://portal.owasp-corp.com/${id}`)}
              >
                <span className="ow-quick-icon">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function CustomersPage({ query, onReveal, onNavigate }) {
  const { request, log } = useBrowser();
  const id = new URLSearchParams(query || "").get("id") || "101";
  const [draft, setDraft] = useState(id);
  const cust = CUSTOMERS[id];

  useEffect(() => {
    if (id === "102") {
      onReveal();
      log("IDOR: opened customer 102 (Priya Sharma) with no ownership check", "error");
    }
  }, [id, onReveal, log]);

  const open = (e) => {
    e.preventDefault();
    request("GET", `/customers?id=${draft}`, CUSTOMERS[draft] ? 200 : 404);
    onNavigate(`/customers?id=${draft}`);
  };

  return (
    <div className="ow-page">
      <Kicker code="A01" title="Broken Access Control" />
      <h2 className="ow-title">Customer directory</h2>
      <p className="ow-sub">
        Records are fetched by <code>id</code> in the URL. Signed in as Alice —
        her record is <b>101</b>.
      </p>

      <form className="ow-inline" onSubmit={open}>
        <label className="ow-label" htmlFor="custid">
          Record id
        </label>
        <input
          id="custid"
          className="ow-field"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck="false"
        />
        <button type="submit" className="ow-btn">
          Open record
        </button>
      </form>

      {cust ? (
        <div className="ow-card">
          <div className="ow-record-head">
            <div>
              <p className="ow-muted">Record #{id}</p>
              <h3 className="ow-card-title">{cust.name}</h3>
            </div>
            <span className="ow-pill">{cust.plan}</span>
          </div>
          <div className="ow-record-grid">
            <div>
              <p className="ow-muted">Contact</p>
              <p>{cust.contact}</p>
            </div>
            <div>
              <p className="ow-muted">Notes</p>
              <p>{cust.note}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="ow-alert err">Record {id} not found.</div>
      )}

      <div className="ow-tip">
        <b>Pro tip:</b> the URL is the only thing deciding which record loads.
        Try editing <code>?id=</code> in the address bar.
      </div>
    </div>
  );
}

function PayrollPage({ onReveal }) {
  const { request, log } = useBrowser();
  const [decoded, setDecoded] = useState(false);

  const decodeAll = () => {
    request("GET", "/payroll/export", 200);
    setDecoded(true);
    onReveal();
    log("payroll export: passwords stored as base64, card numbers in plaintext", "error");
  };

  return (
    <div className="ow-page">
      <Kicker code="A02" title="Cryptographic Failures" />
      <h2 className="ow-title">Payroll records</h2>
      <p className="ow-sub">
        Employee passwords are <b>encoded</b>, not hashed — and payment cards
        are stored in plaintext.
      </p>

      <div className="ow-card ow-table-wrap">
        <table className="ow-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Role</th>
              <th>Password (stored)</th>
              <th>Card number</th>
            </tr>
          </thead>
          <tbody>
            {EMPLOYEES.map((e) => (
              <tr key={e.name}>
                <td>{e.name}</td>
                <td>{e.role}</td>
                <td>
                  <code className="ow-code">{e.password}</code>
                </td>
                <td>{e.card}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="ow-btn" onClick={decodeAll}>
          Decode stored passwords
        </button>
        {decoded ? (
          <div className="ow-alert err">
            Decoded: Admin@123 · Summer2024 · password123 — plaintext stored,
            no salt, no hash. {"FLAG{w34k_crypt0_p4y}"}
          </div>
        ) : null}
      </div>

      <div className="ow-tip">
        <b>Pro tip:</b> those password blobs are base64 — the DevTools box can
        decode them for you.
      </div>
    </div>
  );
}

function SearchPage({ onReveal }) {
  const [q, setQ] = useState("");
  const [result, setResult] = useState(null);
  const { request, log } = useBrowser();

  const submit = (e) => {
    e.preventDefault();
    request("POST", "/api/search", 200);
    log(`search: ${q || ""}`, /union/i.test(q) ? "error" : "info");
    if (/union/i.test(q)) {
      setResult({ ok: true, text: "Result set merged — credentials leaked." });
      onReveal();
    } else {
      setResult({ ok: false, text: "No products matched your query." });
    }
  };

  return (
    <div className="ow-page">
      <Kicker code="A03" title="Injection" />
      <h2 className="ow-title">Product search</h2>
      <p className="ow-sub">
        The search term is concatenated straight into a SQL statement.
      </p>

      <form className="ow-inline" onSubmit={submit}>
        <label className="ow-label" htmlFor="q">
          Query
        </label>
        <input
          id="q"
          className="ow-field"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="' UNION SELECT username, password FROM users--"
          spellCheck="false"
        />
        <button type="submit" className="ow-btn">
          Search
        </button>
      </form>

      <div className="ow-card">
        <pre className="ow-code">
          {`SELECT name, price FROM products\nWHERE name LIKE '%${q || "…"}'`}
        </pre>
      </div>

      {result ? (
        <div className={`ow-alert ${result.ok ? "err" : ""}`}>{result.text}</div>
      ) : null}
      {result?.ok ? (
        <div className="ow-card ow-table-wrap">
          <table className="ow-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Password</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>admin</td>
                <td>{"FLAG{1nj3ct10n_5ql}"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function ResetPage({ onReveal }) {
  const [email, setEmail] = useState("");
  const [out, setOut] = useState(null);
  const { request, log } = useBrowser();

  const submit = (e) => {
    e.preventDefault();
    request("POST", "/api/reset", 200);
    log(`password reset for: ${email || ""}`, "info");
    if (email.trim().toLowerCase() === "admin@owasp-corp.com") {
      setOut({
        ok: true,
        text: "Reset link sent to admin@owasp-corp.com — link token: admin (predictable, based on username). FLAG{1ns3cur3_d3s1gn}",
      });
      onReveal();
    } else {
      setOut({
        ok: false,
        text: "No account exists for that email address.",
      });
    }
  };

  return (
    <div className="ow-page">
      <Kicker code="A04" title="Insecure Design" />
      <h2 className="ow-title">Password reset</h2>
      <p className="ow-sub">
        Designed without rate limiting, and the response tells you whether an
        account exists.
      </p>

      <form className="ow-inline" onSubmit={submit}>
        <label className="ow-label" htmlFor="email">
          Work email
        </label>
        <input
          id="email"
          className="ow-field"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@owasp-corp.com"
          spellCheck="false"
        />
        <button type="submit" className="ow-btn">
          Send reset link
        </button>
      </form>

      {out ? (
        <div className={`ow-alert ${out.ok ? "err" : ""}`}>{out.text}</div>
      ) : null}

      <div className="ow-tip">
        <b>Pro tip:</b> compare the answer for a real email versus a made-up
        one — then look at what the reset token is built from.
      </div>
    </div>
  );
}

function DebugPage({ onReveal }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stack, setStack] = useState(false);
  const { request, log } = useBrowser();

  const submit = (e) => {
    e.preventDefault();
    request("POST", "/debug/login", authed ? 200 : 200);
    if (user === "admin" && pass === "admin") {
      setAuthed(true);
      setStack(true);
      onReveal();
      log("debug console: logged in with default credentials admin/admin", "error");
    } else {
      setStack(true);
      setAuthed(false);
      log("debug console: login failed with verbose stack trace exposed", "warn");
    }
  };

  return (
    <div className="ow-page">
      <Kicker code="A05" title="Security Misconfiguration" />
      <h2 className="ow-title">Debug console</h2>
      <p className="ow-sub">
        A production endpoint left enabled, with default credentials and
        verbose error output.
      </p>

      {!authed ? (
        <form className="ow-inline" onSubmit={submit}>
          <label className="ow-label" htmlFor="duser">
            Username
          </label>
          <input
            id="duser"
            className="ow-field"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="admin"
            autoComplete="off"
            spellCheck="false"
          />
          <label className="ow-label" htmlFor="dpass">
            Password
          </label>
          <input
            id="dpass"
            className="ow-field"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="admin"
            autoComplete="off"
          />
          <button type="submit" className="ow-btn">
            Connect
          </button>
        </form>
      ) : null}

      {stack ? (
        <div className="ow-card">
          <pre className="ow-code">
            {authed
              ? `OK — authenticated with defaults.

DB_USER    = root
DB_PASS    = root
APP_SECRET = donotdeploy
FLAG{d3f4ult_cr3ds_1n}`
              : `Error: com.owasp.corp.DbConnection
  Connection string malformed at line 41.
  Reason: host unreachable
  Connection string: jdbc:mysql://db.internal:3306/app
  Root cause stack trace (full):
    java.sql.SQLException: Cannot connect to db.internal
    at com.owasp.corp.Db.pool(Unknown Source) ... 42 more`}
          </pre>
        </div>
      ) : null}

      <div className="ow-tip">
        <b>Pro tip:</b> shipped defaults are the first thing an attacker tries.
      </div>
    </div>
  );
}

function ComponentsPage({ onReveal }) {
  const [q, setQ] = useState("");
  const [out, setOut] = useState(null);
  const { request, log } = useBrowser();

  const submit = (e) => {
    e.preventDefault();
    request("POST", "/api/components/search", 200);
    log(`component lookup: ${q || ""}`, /jndi/i.test(q) ? "error" : "info");
    if (/\$\{jndi/i.test(q)) {
      setOut(
        "Log4j 2.14.1 evaluated ${jndi} — JNDI lookup executed against the server. FLAG{outd4t3d_l0g4j}"
      );
      onReveal();
    } else {
      setOut("Component scanned — no result.");
    }
  };

  return (
    <div className="ow-page">
      <Kicker code="A06" title="Vulnerable & Outdated Components" />
      <h2 className="ow-title">Software inventory</h2>
      <p className="ow-sub">
        Third-party libraries in production. Some are years past end-of-life.
      </p>

      <div className="ow-card ow-table-wrap">
        <table className="ow-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Version</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Log4j (logging)</td>
              <td>2.14.1</td>
              <td className="ow-risk">EOL · 10+ known CVEs</td>
            </tr>
            <tr>
              <td>Struts web framework</td>
              <td>2.3.20</td>
              <td className="ow-risk">EOL · critical CVEs</td>
            </tr>
            <tr>
              <td>Jackson JSON</td>
              <td>2.9.8</td>
              <td>In support</td>
            </tr>
          </tbody>
        </table>
      </div>

      <form className="ow-inline" onSubmit={submit}>
        <label className="ow-label" htmlFor="comp">
          Scan a library
        </label>
        <input
          id="comp"
          className="ow-field"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="library name"
          spellCheck="false"
        />
        <button type="submit" className="ow-btn">
          Scan
        </button>
      </form>

      {out ? <div className="ow-alert err">{out}</div> : null}

      <div className="ow-tip">
        <b>Pro tip:</b> the scan logs every lookup through the old Log4j. Feed
        it a JNDI payload.
      </div>
    </div>
  );
}

function SessionPage({ token, onReveal }) {
  const [draft, setDraft] = useState(token);
  const { setCookie, request, log } = useBrowser();

  const save = (e) => {
    e.preventDefault();
    request("POST", "/api/session", 200);
    setCookie("session", draft.trim());
    log(`session token updated: ${draft}`, draft.startsWith("admin") ? "error" : "info");
    if (draft.trim().startsWith("admin")) onReveal();
  };

  return (
    <div className="ow-page">
      <Kicker code="A07" title="Identification & Authentication Failures" />
      <h2 className="ow-title">Session manager</h2>
      <p className="ow-sub">
        Your session cookie is a plaintext <code>username:counter</code> pair
        with no expiry and no server-side record.
      </p>

      <div className="ow-card">
        <p className="ow-muted">Current session cookie</p>
        <code className="ow-code ow-cookie-show">{token}</code>
        <form className="ow-inline" onSubmit={save}>
          <label className="ow-label" htmlFor="tok">
            New token
          </label>
          <input
            id="tok"
            className="ow-field"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="username:counter"
            spellCheck="false"
          />
          <button type="submit" className="ow-btn">
            Save to cookie jar
          </button>
        </form>
        <p className="ow-tip-inline">
          The value is just <code>username:counter</code> — guess what{" "}
          <code>admin:1</code> gets you.
        </p>
      </div>
    </div>
  );
}

function UpdatesPage({ onReveal }) {
  const [installed, setInstalled] = useState(false);
  const { request, log } = useBrowser();

  const install = () => {
    request("POST", "/api/update/install", 200);
    setInstalled(true);
    onReveal();
    log("update v2.3.0 installed WITHOUT signature verification", "error");
  };

  return (
    <div className="ow-page">
      <Kicker code="A08" title="Software & Data Integrity Failures" />
      <h2 className="ow-title">Update center</h2>
      <p className="ow-sub">
        Releases are pushed to every server with no signature or checksum
        verification.
      </p>

      <div className="ow-card">
        <div className="ow-record-head">
          <div>
            <h3 className="ow-card-title">owasp-agent v2.3.0</h3>
            <p className="ow-muted">
              Published 14:02 · <b>manifest signature: not verified</b> · SHA-256:
              not checked
            </p>
          </div>
          <button className="ow-btn" onClick={install}>
            Download & install
          </button>
        </div>
        {installed ? (
          <div className="ow-alert err">
            Installed v2.3.0 on 12 servers without verifying who signed it.{" "}
            {"FLAG{unv3r1f1ed_upd4t3}"}
          </div>
        ) : null}
      </div>

      <div className="ow-tip">
        <b>Pro tip:</b> integrity checks are the difference between an update
        and an attacker's payload wearing a version number.
      </div>
    </div>
  );
}

function SecurityPage({ onReveal }) {
  const [ran, setRan] = useState(false);
  const { request, log } = useBrowser();

  const run = () => {
    request("POST", "/api/security/self-test", 200);
    setRan(true);
    onReveal();
    log("self-test: 5 failed logins performed — 0 logged, 0 alerts raised", "error");
  };

  return (
    <div className="ow-page">
      <Kicker code="A09" title="Security Logging & Monitoring Failures" />
      <h2 className="ow-title">Security center</h2>
      <p className="ow-sub">
        A self-test that simulates an attacker's failed-login spray to prove
        the platform can detect it.
      </p>

      <div className="ow-card">
        <div className="ow-record-head">
          <div>
            <h3 className="ow-card-title">Detection self-test</h3>
            <p className="ow-muted">
              Simulates 5 failed logins and 1 config change, then reports what
              was captured.
            </p>
          </div>
          <button className="ow-btn" onClick={run}>
            Run self-test
          </button>
        </div>
        {ran ? (
          <div className="ow-alert err">
            Audit log: <b>0 events captured</b> · SIEM: <b>0 alerts raised</b> ·
            MFA bypass attempt: unnoticed. {"FLAG{n0_l0gg1ng_m0n1t0r1ng}"}
          </div>
        ) : null}
      </div>

      <div className="ow-tip">
        <b>Pro tip:</b> the breach you can't see is the one that runs for
        months. Logging and monitoring are detection controls, not paperwork.
      </div>
    </div>
  );
}

function ProxyPage({ onReveal }) {
  const [target, setTarget] = useState("https://example.com/");
  const [out, setOut] = useState(null);
  const { request, log } = useBrowser();

  const internal = /(127\.0\.0\.1|localhost|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/i;

  const fetchUrl = (e) => {
    e.preventDefault();
    request("GET", `/api/proxy?url=${encodeURIComponent(target)}`, 200);
    log(`proxy fetch: ${target}`, internal.test(target) ? "error" : "info");
    if (internal.test(target)) {
      setOut({
        evil: true,
        text: `Internal target reached — response: 200 OK, "welcome to metadata service". FLAG{5srf_1nt3rn4l_4cc}`,
      });
      onReveal();
    } else {
      setOut({ evil: false, text: "Fetched successfully — external host." });
    }
  };

  return (
    <div className="ow-page">
      <Kicker code="A10" title="Server-Side Request Forgery" />
      <h2 className="ow-title">URL proxy</h2>
      <p className="ow-sub">
        Fetch a URL <b>server-side</b> — handy for admins, and for anyone who
        knows the internal network is a URL away.
      </p>

      <form className="ow-inline" onSubmit={fetchUrl}>
        <label className="ow-label" htmlFor="target">
          Target URL
        </label>
        <input
          id="target"
          className="ow-field"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          spellCheck="false"
        />
        <button type="submit" className="ow-btn">
          Fetch
        </button>
      </form>

      {out ? (
        <div className={`ow-alert ${out.evil ? "err" : ""}`}>{out.text}</div>
      ) : null}

      <div className="ow-tip">
        <b>Pro tip:</b> the fetch runs on the internal network. What does{" "}
        <code>http://127.0.0.1/</code> return?
      </div>
    </div>
  );
}

function Page({ page, query, onReveal, onNavigate, session }) {
  switch (page) {
    case "dashboard":
      return <DashboardPage onNavigate={onNavigate} />;
    case "customers":
      return <CustomersPage query={query} onReveal={onReveal} onNavigate={onNavigate} />;
    case "payroll":
      return <PayrollPage onReveal={onReveal} />;
    case "search":
      return <SearchPage onReveal={onReveal} />;
    case "reset":
      return <ResetPage onReveal={onReveal} />;
    case "debug":
      return <DebugPage onReveal={onReveal} />;
    case "components":
      return <ComponentsPage onReveal={onReveal} />;
    case "session":
      return <SessionPage token={session} onReveal={onReveal} />;
    case "updates":
      return <UpdatesPage onReveal={onReveal} />;
    case "security":
      return <SecurityPage onReveal={onReveal} />;
    case "proxy":
      return <ProxyPage onReveal={onReveal} />;
    default:
      return null;
  }
}

export default function OwaspPortal({ onReveal }) {
  return (
    <BrowserFrame domain="owasp-corp.com">
      <PortalInner onReveal={onReveal} />
    </BrowserFrame>
  );
}

function PortalInner({ onReveal }) {
  const [raw, setRaw] = useState("https://portal.owasp-corp.com/dashboard");
  const [path, setPath] = useState("/dashboard");
  const { cookies, setCookie, request, log } = useBrowser();

  useEffect(() => {
    if (!cookies.session) setCookie("session", DEFAULT_SESSION);
  }, [cookies.session, setCookie]);

  const session = cookies.session || DEFAULT_SESSION;

  const reveal = (id, flag) => {
    log(`[+] Finding confirmed: ${id} → ${flag}`, "ok");
    onReveal(id, flag);
  };

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
    const nextPath = `${u.pathname}${u.search}`;
    setPath(nextPath);
    const p = nextPath.split("?")[0].split("/")[1] || "dashboard";
    request("GET", u.pathname, KNOWN_PAGES.includes(p) ? 200 : 404);
  };

  const page = path.split("?")[0].split("/")[1] || "dashboard";
  const query = path.includes("?") ? path.slice(path.indexOf("?")) : "";

  return (
    <div className="ow-sp">
      <BrowserChrome url={raw} onNavigate={navigate} editable />
      <div className="ow-shell">
        <header className="ow-topbar">
          <div className="ow-brand">
            <span className="ow-brand-mark">◆</span> OWASP Corp
          </div>
          <div className="ow-topbar-right">
            <span className="ow-signed">Signed in as {sessionUser(session)}</span>
            <span className="ow-pill">Sandbox</span>
          </div>
        </header>
        <div className="ow-layout">
          <aside className="ow-sidebar">
            {NAV.map((g) => (
              <div className="ow-nav-group" key={g.group}>
                <p className="ow-nav-head">{g.group}</p>
                {g.items.map(([id, label, icon]) => (
                  <button
                    key={id}
                    className={`ow-nav-item ${page === id ? "on" : ""}`}
                    onClick={() => navigate(`https://portal.owasp-corp.com/${id}`)}
                  >
                    <span className="ow-nav-icon">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            ))}
          </aside>
          <main className="ow-main">
            <Page
              page={page}
              query={query}
              onReveal={reveal}
              onNavigate={navigate}
              session={session}
            />
            {!KNOWN_PAGES.includes(page) ? (
              <div className="ow-page">
                <Kicker code="404" title="Not found" />
                <h2 className="ow-title">Page not found</h2>
                <p className="ow-sub">{path} does not exist.</p>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
