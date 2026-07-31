import { useEffect, useState } from "react";

import { useBrowser } from "../browserCtx";
import { useHunt } from "../../context/hunt";
import BrowserFrame from "../BrowserFrame";
import { BrowserChrome } from "../SimBrowser";

const DEFAULT_SESSION = "cashier:ravi";

const sessionUser = (s) => String(s || DEFAULT_SESSION).split(":")[0];
const sessionRole = (s) => String(s || DEFAULT_SESSION).split(":")[1] || "staff";

const MENU = [
  ["Masala Tea", "₹20", "🥤"],
  ["Green Tea", "₹25", "🍵"],
  ["Ginger Tea", "₹20", "🍂"],
  ["Lemon Tea", "₹25", "🍋"],
  ["Filter Coffee", "₹30", "☕"],
  ["Milk", "₹15", "🥛"],
  ["Samosa", "₹15", "🥟"],
  ["Cookies", "₹10", "🍪"],
];

const INVOICES = {
  1001: { customer: "Ravi Kumar", items: "2 × Masala Tea", amount: "₹40", note: "Walk-in" },
  1002: { customer: "Anita Rao", items: "1 × Filter Coffee, 2 × Samosa", amount: "₹60", note: "VIP — call before delivery. FLAG{1d0r_1nv01c3_1002}" },
  1003: { customer: "Farhan Ali", items: "3 × Lemon Tea", amount: "₹75", note: "Walk-in" },
};

const CUSTOMERS = [
  { id: 1, name: "Ravi Kumar", phone: "98765 43210", points: 340 },
  { id: 2, name: "Anita Rao", phone: "91234 56789", points: 890 },
  { id: 3, name: "Farhan Ali", phone: "90080 12345", points: 120 },
  { id: 4, name: "admin", phone: "00000 00000", points: 9999 },
];

const INVENTORY = [
  { item: "Tea Powder", stock: 42, supplier: "Nilgiri Exports", expiry: "2026-12" },
  { item: "Milk", stock: 18, supplier: "Amul Dairy", expiry: "2026-08" },
  { item: "Sugar", stock: 55, supplier: "Sweet Co.", expiry: "2027-01" },
  { item: "Paper Cups", stock: 500, supplier: "Pack & Go", expiry: "—" },
];

const EMPLOYEES = [
  { name: "Geeta", role: "Admin", phone: "98111 00001", photo: "/img/geeta.png" },
  { name: "Ravi", role: "Cashier", phone: "98111 00002", photo: "/img/ravi.png" },
  { name: "Suresh", role: "Kitchen", phone: "98111 00003", photo: "/img/suresh.png" },
  { name: "Meena", role: "Delivery", phone: "98111 00004", photo: "/img/meena.png" },
];

const LABS = [
  { n: 1, id: "tea-sqli", title: "SQL Injection", page: "customers", module: "Customers", cls: "A03 Injection", short: "Customer search concatenates input into SQL." },
  { n: 2, id: "tea-idor", title: "IDOR", page: "orders", module: "Orders", cls: "A01 Broken Access Control", short: "Invoice 1002 is one URL edit away." },
  { n: 3, id: "tea-auth", title: "Weak Authentication", page: "login", module: "Login", cls: "A07 Auth Failures", short: "admin / 123456 — no lockout, no MFA." },
  { n: 4, id: "tea-xss", title: "XSS", page: "feedback", module: "Feedback", cls: "A03 Injection", short: "Feedback renders unescaped for the owner." },
  { n: 5, id: "tea-csrf", title: "CSRF", page: "settings", module: "Settings", cls: "A01 Broken Access Control", short: "Password change has no CSRF token." },
  { n: 6, id: "tea-upload", title: "File Upload", page: "employees", module: "Employees", cls: "A03 Injection", short: "Photo upload accepts any file type." },
  { n: 7, id: "tea-info", title: "Information Disclosure", page: "admin", module: "Admin", cls: "A05 Misconfiguration", short: "Debug console leaks keys, version, DB name." },
  { n: 8, id: "tea-session", title: "Session Hijacking", page: "settings", module: "Settings", cls: "A07 Auth Failures", short: "Cookie lacks Secure / HttpOnly / SameSite." },
  { n: 9, id: "tea-access", title: "Broken Access Control", page: "admin", module: "Admin", cls: "A01 Broken Access Control", short: "Cashier walks into the admin panel." },
  { n: 10, id: "tea-ssrf", title: "SSRF", page: "inventory", module: "Inventory", cls: "A10 SSRF", short: "Supplier URL import fetches server-side." },
];

const CHAIN = [
  { lab: "tea-info", label: "Information Leak", page: "admin", sub: "Debug console leaks DB name, version, API keys." },
  { lab: "tea-auth", label: "Weak Password", page: "login", sub: "admin / 123456 — no lockout, no MFA." },
  { lab: "tea-auth", label: "Login", page: "login", sub: "Default credentials hand you the owner's role." },
  { lab: "tea-idor", label: "IDOR", page: "orders", sub: "Invoice 1002 reveals a VIP customer's data." },
  { lab: "tea-sqli", label: "Customer Database", page: "customers", sub: "SQLi in search dumps the entire customer table." },
  { lab: "tea-access", label: "Admin Panel", page: "admin", sub: "Only the UI checks the role — cashier walks in." },
  { lab: "tea-session", label: "Sensitive Data Exposure", page: "settings", sub: "Session cookie readable, sendable, predictable." },
];

const BADGES = [
  { id: "apprentice", name: "Tea Apprentice", icon: "🥉", need: (done) => Object.values(done).filter(Boolean).length >= 1 },
  { id: "sql", name: "SQL Hunter", icon: "🥈", need: (done) => done["tea-sqli"] },
  { id: "access", name: "Access Master", icon: "🥇", need: (done) => done["tea-idor"] },
  { id: "chain", name: "Chain Hunter", icon: "🐺", need: (done) => done["tea-chain"] },
  { id: "expert", name: "Tea Security Expert", icon: "👑", need: (done) => Object.values(done).filter(Boolean).length >= 10 },
];

function Kicker({ text }) {
  return <p className="tea-kicker">{text}</p>;
}

function Remediate({ title, lines }) {
  return (
    <details className="tea-fix">
      <summary>
        <span>🩹 Blue team — how to fix this</span>
        <span className="tea-fix-title">{title}</span>
      </summary>
      <div className="tea-fix-body">
        {lines.map((l, i) =>
          typeof l === "string" ? (
            <p key={i}>{l}</p>
          ) : (
            <pre key={i} className="tea-code">
              {l.code}
            </pre>
          )
        )}
      </div>
    </details>
  );
}

function DashboardPage({ onNavigate }) {
  return (
    <div className="tea-page">
      <Kicker text="Cyber Tea House · Dashboard" />
      <h2 className="tea-title">Today's overview</h2>
      <p className="tea-sub">All counters refresh live from the POS.</p>

      <div className="tea-stats">
        <div className="tea-stat">
          <span>Today's Sales</span>
          <strong>₹8,520</strong>
        </div>
        <div className="tea-stat">
          <span>Orders</span>
          <strong>52</strong>
        </div>
        <div className="tea-stat">
          <span>Customers</span>
          <strong>34</strong>
        </div>
        <div className="tea-stat">
          <span>Employees</span>
          <strong>8</strong>
        </div>
        <div className="tea-stat">
          <span>Inventory</span>
          <strong>125 items</strong>
        </div>
      </div>

      <div className="tea-card">
        <h3 className="tea-card-title">Quick modules</h3>
        <p className="tea-muted">
          This is a deliberately vulnerable sandbox — a local tea shop's real
          management system, frozen for your training. Nothing leaves your
          browser. Start with the customer search, then follow the attack chain
          tab.
        </p>
        <div className="tea-quick">
          {LABS.map((l) => (
            <button
              key={l.n}
              className="tea-quick-btn"
              onClick={() => onNavigate(`/labs`)}
            >
              <b>Lab {l.n}</b>
              <span>{l.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuPage() {
  return (
    <div className="tea-page">
      <Kicker text="Cyber Tea House · Menu" />
      <h2 className="tea-title">Tea menu</h2>
      <p className="tea-sub">Fresh stock, listed on the wall board.</p>
      <div className="tea-menu">
        {MENU.map(([name, price, icon]) => (
          <div className="tea-menu-item" key={name}>
            <span className="tea-menu-icon">{icon}</span>
            <div>
              <b>{name}</b>
              <span className="tea-muted">{price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersPage({ query, onReveal, onNavigate }) {
  const { request, log } = useBrowser();
  const id = new URLSearchParams(query || "").get("id") || "1001";
  const [draft, setDraft] = useState(id);
  const inv = INVOICES[id];

  useEffect(() => {
    if (id === "1002") {
      onReveal();
      log("IDOR: opened invoice 1002 belonging to another customer", "error");
    }
  }, [id, onReveal, log]);

  const open = (e) => {
    e.preventDefault();
    request("GET", `/invoice?id=${draft}`, INVOICES[draft] ? 200 : 404);
    onNavigate(`/invoice?id=${draft}`);
  };

  return (
    <div className="tea-page">
      <Kicker text="Cyber Tea House · Orders" />
      <h2 className="tea-title">Order management</h2>
      <p className="tea-sub">
        Invoice <b>1001</b> belongs to the signed-in cashier. Every invoice is
        one <code>id</code> away.
      </p>

      <form className="tea-inline" onSubmit={open}>
        <label className="tea-label" htmlFor="inv">Invoice no.</label>
        <input
          id="inv"
          className="tea-field"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck="false"
        />
        <button type="submit" className="tea-btn">Open invoice</button>
      </form>

      {inv ? (
        <div className="tea-card">
          <p className="tea-muted">Invoice #{id}</p>
          <h3 className="tea-card-title">{inv.customer}</h3>
          <p className="tea-muted">{inv.items}</p>
          <p className="tea-amount">{inv.amount}</p>
          <p className="tea-note">{inv.note}</p>
        </div>
      ) : (
        <div className="tea-alert err">Invoice {id} not found.</div>
      )}

      <div className="tea-tip">
        <b>Try:</b> change <code>?id=1001</code> to <code>?id=1002</code> in
        the address bar.
      </div>
    </div>
  );
}

function CustomersPage({ onReveal }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState(CUSTOMERS);
  const [solved, setSolved] = useState(false);
  const { request, log } = useBrowser();

  const search = (e) => {
    e.preventDefault();
    request("POST", `/api/customers/search?name=${encodeURIComponent(q)}`, 200);
    log(`customer search: ${q || ""}`, /or|union/i.test(q) ? "error" : "info");
    if (/or '1'='1|union/i.test(q)) {
      setRows([
        ...CUSTOMERS,
        { id: "SYS", name: "admin", phone: "hashed", points: "FLAG{5ql1_cu5t0m3r_dump}" },
      ]);
      setSolved(true);
      onReveal();
    } else if (q.trim()) {
      setRows(CUSTOMERS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())));
    } else {
      setRows(CUSTOMERS);
    }
  };

  return (
    <div className="tea-page">
      <Kicker text="Cyber Tea House · Customers" />
      <h2 className="tea-title">Customer search</h2>
      <p className="tea-sub">
        Type a name and the app builds the query by pasting it into SQL.
      </p>

      <form className="tea-inline" onSubmit={search}>
        <label className="tea-label" htmlFor="cq">Customer name</label>
        <input
          id="cq"
          className="tea-field"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Ravi"
          spellCheck="false"
        />
        <button type="submit" className="tea-btn">Search</button>
      </form>

      {solved ? (
        <div className="tea-alert err">
          Query returned the whole table — the auth check on this panel is the
          only thing standing between staff and the customer database.
        </div>
      ) : null}

      <div className="tea-card tea-table-wrap">
        <table className="tea-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Reward Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Remediate
        title="Parameterized queries — never concatenate input into SQL"
        lines={[
          "The search builds `WHERE name LIKE '%" + q + "%'` as a string. An attacker closes the quote and appends `OR '1'='1` (or a UNION) to dump every row.",
          { code: "// ❌ vulnerable\nconst sql = `SELECT * FROM customers\n  WHERE name LIKE '%${input}%'`;" },
          { code: "// ✅ safe — bound parameters\nconst rows = db.prepare(\n  \"SELECT * FROM customers WHERE name LIKE ?\"\n).all(`%${input}%`);" },
        ]}
      />
    </div>
  );
}

function InventoryPage({ onReveal }) {
  const [url, setUrl] = useState("");
  const [out, setOut] = useState(null);
  const { request, log } = useBrowser();

  const importUrl = (e) => {
    e.preventDefault();
    request("POST", `/api/supplier/import?url=${encodeURIComponent(url)}`, 200);
    log(`supplier import: ${url || ""}`, /127\.0\.0\.1|localhost/i.test(url) ? "error" : "info");
    if (/127\.0\.0\.1|localhost|10\.|192\.168\./i.test(url)) {
      setOut({ evil: true, text: "Server fetched an internal endpoint — stock list overridden with metadata. FLAG{55rf_5uppl13r}" });
      onReveal();
    } else {
      setOut({ evil: false, text: "Supplier catalogue imported from external URL." });
    }
  };

  return (
    <div className="tea-page">
      <Kicker text="Cyber Tea House · Inventory" />
      <h2 className="tea-title">Stock levels</h2>
      <p className="tea-sub">Inventory is refreshed from supplier catalogue URLs.</p>

      <div className="tea-card tea-table-wrap">
        <table className="tea-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Stock</th>
              <th>Supplier</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {INVENTORY.map((r) => (
              <tr key={r.item}>
                <td>{r.item}</td>
                <td>{r.stock}</td>
                <td>{r.supplier}</td>
                <td>{r.expiry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="tea-inline" onSubmit={importUrl}>
        <label className="tea-label" htmlFor="su">Supplier URL</label>
        <input
          id="su"
          className="tea-field"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://supplier.example/catalog.json"
          spellCheck="false"
        />
        <button type="submit" className="tea-btn">Import</button>
      </form>

      {out ? <div className={`tea-alert ${out.evil ? "err" : ""}`}>{out.text}</div> : null}

      <div className="tea-tip">
        <b>Try:</b> the fetch runs on the shop's server. What does{" "}
        <code>http://127.0.0.1/internal</code> return?
      </div>

      <Remediate
        title="SSRF — allowlist destinations, block private ranges"
        lines={[
          "A server-side fetch of user input becomes a tunnel to internal services and cloud metadata.",
          "Deny loopback (127.0.0.1, ::1), link-local (169.254.*) and private ranges (10.*, 172.16-31.*, 192.168.*). Resolve DNS and re-validate the final IP.",
          { code: "// ✅ safe — validate the resolved address server-side\nconst ip = await dns.lookup(new URL(url).hostname);\nif (isPrivate(ip) || isLoopback(ip)) return 400;\nreturn fetchWithEgressProxy(url);" },
        ]}
      />
    </div>
  );
}

function EmployeesPage({ onReveal }) {
  const [file, setFile] = useState("");
  const [out, setOut] = useState(null);
  const { request, log } = useBrowser();

  const upload = (e) => {
    e.preventDefault();
    request("POST", "/api/employees/photo", 200);
    log(`photo upload: ${file || "(none)"}`, /\.(php|jsp|sh)$/i.test(file) ? "error" : "info");
    if (/\.(php|jsp|sh)$/i.test(file)) {
      setOut({ evil: true, text: "Uploaded as an executable script — a visitor's request to /uploads/… runs it. FLAG{up10ad_3xt_ch3ck}" });
      onReveal();
    } else if (file) {
      setOut({ evil: false, text: "Photo saved." });
    }
  };

  return (
    <div className="tea-page">
      <Kicker text="Cyber Tea House · Employees" />
      <h2 className="tea-title">Staff directory</h2>
      <p className="tea-sub">Signed in as <b>Ravi</b> (Cashier). Note who is allowed where.</p>

      <div className="tea-card tea-table-wrap">
        <table className="tea-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Photo</th>
            </tr>
          </thead>
          <tbody>
            {EMPLOYEES.map((e) => (
              <tr key={e.name}>
                <td>{e.name}</td>
                <td>{e.role}</td>
                <td>{e.phone}</td>
                <td className="tea-photo">🖼</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="tea-inline" onSubmit={upload}>
        <label className="tea-label" htmlFor="up">Employee photo</label>
        <input
          id="up"
          className="tea-field"
          value={file}
          onChange={(e) => setFile(e.target.value)}
          placeholder="photo.php"
          spellCheck="false"
        />
        <button type="submit" className="tea-btn">Upload</button>
      </form>

      {out ? <div className={`tea-alert ${out.evil ? "err" : ""}`}>{out.text}</div> : null}

      <div className="tea-tip">
        <b>Try:</b> a filename like <code>evil.php</code> — the server never
        checks the extension or content.
      </div>

      <Remediate
        title="File upload — whitelist extensions and inspect content"
        lines={[
          "An uploaded script in a web-accessible folder means arbitrary code execution on the server.",
          "Allowlist image MIME types, check the real magic bytes, store files outside the web root, and serve them with Content-Disposition: attachment.",
          { code: "if (!['image/jpeg','image/png'].includes(file.type)) return 400;\n// plus: verify magic bytes, randomize the filename,\n// store outside web root, never execute." },
        ]}
      />
    </div>
  );
}

function FeedbackPage({ onReveal }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [entries, setEntries] = useState([
    { name: "Meena", text: "Delivery was fast, chai was hot!" },
  ]);
  const [out, setOut] = useState(null);
  const { request, log } = useBrowser();

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    request("POST", "/api/feedback", 201);
    setEntries((es) => [...es, { name: name || "anonymous", text }]);
    if (/<script|onerror=/i.test(text)) {
      setOut({ evil: true, text: "Feedback saved as raw HTML — the owner's browser executes it. FLAG{x55_f33db4ck}" });
      log("stored XSS: owner views feedback → script runs in their session", "error");
      onReveal();
    } else {
      setOut({ evil: false, text: "Feedback saved." });
    }
    setText("");
  };

  return (
    <div className="tea-page">
      <Kicker text="Cyber Tea House · Feedback" />
      <h2 className="tea-title">Customer feedback</h2>
      <p className="tea-sub">The owner opens this page every evening — comments render as raw HTML.</p>

      <form className="tea-inline" onSubmit={submit}>
        <label className="tea-label" htmlFor="fn">Name</label>
        <input
          id="fn"
          className="tea-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          spellCheck="false"
        />
        <label className="tea-label" htmlFor="fb">Feedback</label>
        <input
          id="fb"
          className="tea-field"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your feedback…"
          spellCheck="false"
        />
        <button type="submit" className="tea-btn">Submit</button>
      </form>

      {out ? <div className={`tea-alert ${out.evil ? "err" : ""}`}>{out.text}</div> : null}

      <div className="tea-card">
        <h3 className="tea-card-title">Wall of feedback</h3>
        {entries.map((en, i) => (
          <div className="tea-feedback" key={i}>
            <b>{en.name}</b>
            <p>{en.text}</p>
          </div>
        ))}
      </div>

      <Remediate
        title="Output encoding — never render user content as HTML"
        lines={[
          "Stored XSS runs in the owner's session, so an attacker can act as the owner.",
          "Escape output at every sink, use a safe rendering engine (textContent, React escaping), and set a strict CSP.",
          { code: "// ✅ safe — React/JSX already escapes {text}\n// avoid dangerouslySetInnerHTML and innerHTML entirely" },
        ]}
      />
    </div>
  );
}

function LoginPage({ session, onReveal }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [status, setStatus] = useState(null);
  const { setCookie, request, log } = useBrowser();

  const submit = (e) => {
    e.preventDefault();
    request("POST", "/api/login", 200);
    log(`login attempt: ${user || ""}`, user === "admin" && pass === "123456" ? "error" : "info");
    if (user === "admin" && pass === "123456") {
      setCookie("tea-session", "admin:owner");
      setStatus({ ok: true, text: "Signed in as admin (owner). Default credentials accepted." });
      onReveal();
    } else if (user === "ravi" && pass === "cashier123") {
      setCookie("tea-session", "cashier:ravi");
      setStatus({ ok: true, text: "Signed in as ravi (cashier)." });
    } else {
      setStatus({ ok: false, text: "Invalid username or password." });
    }
  };

  return (
    <div className="tea-page">
      <Kicker text="Cyber Tea House · Login" />
      <h2 className="tea-title">Staff sign in</h2>
      <p className="tea-sub">
        Currently <b>{sessionUser(session)}</b> ({sessionRole(session)}). The
        password policy allows anything — even <code>123456</code>.
      </p>

      <form className="tea-inline" onSubmit={submit}>
        <label className="tea-label" htmlFor="luser">Username</label>
        <input
          id="luser"
          className="tea-field"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="username"
          autoComplete="off"
          spellCheck="false"
        />
        <label className="tea-label" htmlFor="lpass">Password</label>
        <input
          id="lpass"
          className="tea-field"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="password"
          autoComplete="off"
        />
        <button type="submit" className="tea-btn">Sign in</button>
      </form>

      {status ? <div className={`tea-alert ${status.ok ? "" : "err"}`}>{status.text}</div> : null}

      <div className="tea-tip">
        <b>Try:</b> the default admin password that ships with every install.
      </div>

      <Remediate
        title="Authentication — MFA, lockout, and real password policy"
        lines={[
          "Default credentials and no lockout mean a brute force is trivial, and every user shares one weak password.",
          "Enforce a minimum password policy, add MFA for admins, lock accounts after N failed attempts, and force credential changes on first login.",
          { code: "policy: {\n  minLength: 12, requireMfa: 'admin',\n  lockout: { attempts: 5, window: '15m' },\n  forceChangeOnFirstLogin: true\n}" },
        ]}
      />
    </div>
  );
}

function SettingsPage({ session, onReveal }) {
  const [cur, setCur] = useState("cashier123");
  const [fresh, setFresh] = useState("");
  const [status, setStatus] = useState(null);
  const [seen, setSeen] = useState(false);
  const { setCookie, request, log } = useBrowser();

  const changePass = (e) => {
    e.preventDefault();
    request("POST", "/api/settings/password", 200);
    log("password change submitted — no CSRF token present", "error");
    setStatus({ ok: true, text: "Password updated. No CSRF token was required — a forged request could do this." });
    if (fresh === "pwned") {
      setCookie("tea-session", session.replace(/:.+/, ":owner"));
    }
    onReveal();
  };

  const inspect = () => {
    setSeen(true);
    log("session cookie: Secure=false, HttpOnly=false, SameSite=None", "error");
    onReveal();
  };

  return (
    <div className="tea-page">
      <Kicker text="Cyber Tea House · Settings" />
      <h2 className="tea-title">Account settings</h2>
      <p className="tea-sub">
        Change password and inspect your session. Signed in as{" "}
        <b>{sessionUser(session)}</b> ({sessionRole(session)}).
      </p>

      <div className="tea-card">
        <h3 className="tea-card-title">Change password</h3>
        <form className="tea-inline" onSubmit={changePass}>
          <label className="tea-label" htmlFor="cur">Current</label>
          <input
            id="cur"
            className="tea-field"
            type="password"
            value={cur}
            onChange={(e) => setCur(e.target.value)}
            autoComplete="off"
          />
          <label className="tea-label" htmlFor="fresh">New</label>
          <input
            id="fresh"
            className="tea-field"
            type="password"
            value={fresh}
            onChange={(e) => setFresh(e.target.value)}
            placeholder="pwned to become owner"
            autoComplete="off"
          />
          <button type="submit" className="tea-btn">Update</button>
        </form>
        {status ? <div className="tea-alert">{status.text}</div> : null}
      </div>

      <div className="tea-card">
        <h3 className="tea-card-title">Session configuration</h3>
        <table className="tea-table">
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Value</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Secure</td>
              <td><code>false</code></td>
              <td>Sent over HTTP</td>
            </tr>
            <tr>
              <td>HttpOnly</td>
              <td><code>false</code></td>
              <td>Readable by scripts</td>
            </tr>
            <tr>
              <td>SameSite</td>
              <td><code>None</code></td>
              <td>Sent cross-site</td>
            </tr>
          </tbody>
        </table>
        <button className="tea-btn ghost" onClick={inspect}>
          Simulate a stolen cookie
        </button>
        {seen ? (
          <div className="tea-alert err">
            Cookie <code>tea-session = {session}</code> was read by a script on
            an attacker's page.{" FLAG{s3ss10n_c00k13}"}
          </div>
        ) : null}
      </div>

      <div className="tea-tip">
        <b>Try:</b> the cookie is editable in the DevTools jar. And a request
        to change the password carries no token at all.
      </div>
    </div>
  );
}

function AdminPage({ session, onReveal }) {
  const [debug, setDebug] = useState(false);
  const { request, log } = useBrowser();
  const role = sessionRole(session);

  useEffect(() => {
    if (role !== "admin") {
      onReveal();
      log("broken access control: cashier reached the admin panel — UI-only guard", "error");
    }
  }, [role, onReveal, log]);

  const openDebug = () => {
    request("GET", "/admin/debug", 200);
    setDebug(true);
    onReveal();
    log("info disclosure: debug console exposed version, DB name, API keys", "error");
  };

  return (
    <div className="tea-page">
      <Kicker text="Cyber Tea House · Admin" />
      <h2 className="tea-title">Admin dashboard</h2>
      <p className="tea-sub">
        Marked "Admin only" in the menu — but you opened it as{" "}
        <b>{sessionUser(session)}</b> ({role}). No server-side check happened.
      </p>

      {role === "admin" ? (
        <div className="tea-alert ok">Owner session detected — welcome back, {sessionUser(session)}.</div>
      ) : (
        <div className="tea-alert err">
          The UI hides this link from non-admins, but the page loads anyway.
        </div>
      )}

      <div className="tea-card">
        <h3 className="tea-card-title">Debug mode</h3>
        <p className="tea-muted">Production diagnostic panel — enabled for everyone.</p>
        <button className="tea-btn" onClick={openDebug}>
          Show stack trace & configuration
        </button>
        {debug ? (
          <pre className="tea-code tea-debug">{`DEBUG CONSOLE — production
------------------------------------------------
Version        : tea-pos v2.4.1 (build 104)
Framework      : Express 4.16.0
Database       : mongodb://admin:admin@db.cyber-tea.in:27017/tea_shop
API keys       : sk_live_tea_7f3c… · GCP: AIzaSyD3x… 
Stack trace    :
  Error: EACCES at /etc/tea-pos/config.js:41
  at Function.Module._compile (internal/modules/cjs/loader.js:705:30)
------------------------------------------------
FLAG{d3bug_l34k5}`}</pre>
        ) : null}
      </div>

      <Remediate
        title="Misconfiguration & access control — lock it server-side"
        lines={[
          "Two failures: the debug console ships to production, and the admin route trusts the UI to hide it.",
          "Disable debug endpoints in prod, rotate leaked keys, suppress verbose errors, and enforce authorization on the server for every privileged route.",
          { code: "// ✅ authorize on the server, never in the menu\nrequireRole(req, 'admin');\n// and: DEBUG_MODE=false in production, error log not stack trace" },
        ]}
      />
    </div>
  );
}

function LabsPage({ done, onNavigate }) {
  const doneCount = Object.values(done).filter(Boolean).length;
  const badges = BADGES.filter((b) => b.need(done));
  const locked = badges.length === 0;

  return (
    <div className="tea-page">
      <Kicker text="Cyber Tea House · Labs" />
      <h2 className="tea-title">Vulnerable labs</h2>
      <p className="tea-sub">
        {doneCount}/10 labs confirmed. Each lab lives inside a real module of
        the shop.
      </p>

      <div className="tea-missions">
        <div className="tea-mission red">
          <p className="tea-mission-kicker">RED TEAM MISSION</p>
          <h4>Obtain the admin dashboard</h4>
          <p className="tea-muted">Difficulty: Medium · Reward: 150 XP · ~20 min</p>
        </div>
        <div className="tea-mission blue">
          <p className="tea-mission-kicker">BLUE TEAM MISSION</p>
          <h4>Apply the fixes</h4>
          <p className="tea-muted">
            Parameterized queries · server-side authorization · MFA ·
            input validation — every lab ships with a "how to fix" panel.
          </p>
        </div>
      </div>

      <div className="tea-card">
        <h3 className="tea-card-title">Badges</h3>
        <div className="tea-badges">
          {BADGES.map((b) => {
            const earned = b.need(done);
            return (
              <span
                key={b.id}
                className={`tea-badge ${earned ? "earned" : ""}`}
                title={earned ? "Earned" : "Locked"}
              >
                {b.icon} {b.name}
              </span>
            );
          })}
        </div>
        {locked ? <p className="tea-muted">Earn your first badge by confirming a lab.</p> : null}
      </div>

      <div className="tea-lab-list">
        {LABS.map((l) => {
          const isDone = done[l.id];
          return (
            <button
              key={l.n}
              className={`tea-lab-row ${isDone ? "done" : ""}`}
              onClick={() => onNavigate(`/${l.page}`)}
            >
              <span className="tea-lab-no">{isDone ? "✓" : l.n}</span>
              <span className="tea-lab-main">
                <b>{l.title}</b>
                <span className="tea-muted">{l.cls}</span>
              </span>
              <span className="tea-lab-short">{l.short}</span>
              <span className="tea-lab-go">{l.module} →</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChainGraph({ steps, done, onNavigate, complete }) {
  const W = 560;
  const H = 96;
  const nodeW = 250;
  const nodeH = 60;
  const nodes = [
    ...steps.map((s, i) => ({
      ...s,
      x: i % 2 === 0 ? 20 : W - nodeW - 20,
      y: i * H + 20,
      done: done[s.lab],
      critical: false,
    })),
    {
      label: "CRITICAL",
      sub: "Full shop compromise — every link chained",
      page: null,
      x: 20,
      y: steps.length * H + 20,
      done: complete,
      critical: true,
    },
  ];

  const cx = (n) => n.x + nodeW / 2;
  const cy = (n) => n.y + nodeH / 2;

  return (
    <svg viewBox={`0 0 ${W} ${steps.length * H + 140}`} className="tea-graph" role="img">
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
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>
      {nodes.slice(0, -1).map((n, i) => {
        const next = nodes[i + 1];
        const x1 = cx(n);
        const y1 = cy(n);
        const x2 = cx(next);
        const y2 = cy(next) - (i === nodes.length - 2 ? 26 : 0);
        const mx = (x1 + x2) / 2;
        const live = n.done;
        return (
          <path
            key={i}
            className={`tea-edge ${live ? "live" : ""}`}
            d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2 - (y1 === y2 ? 0 : (y2 - y1) * 0.4)}, ${x2} ${y2}`}
            markerEnd="url(#arrow)"
          />
        );
      })}
      {nodes.map((n, i) => (
        <g key={i}>
          <rect
            x={n.x}
            y={n.y}
            width={nodeW}
            height={nodeH}
            rx="10"
            className={`tea-node ${n.critical ? (n.done ? "crit done" : "crit") : n.done ? "done" : ""}`}
            onClick={() => n.page && onNavigate(`/${n.page}`)}
          />
          <text x={n.x + 14} y={n.y + 24} className="tea-node-label">
            {n.critical ? "⛔" : n.done ? "✓" : "○"} {n.label}
          </text>
          <text x={n.x + 14} y={n.y + 44} className="tea-node-sub">
            {n.critical ? "Confirm the full chain" : n.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ChainPage({ done, onReveal, onNavigate, isComplete }) {
  const { log } = useBrowser();
  const stepsDone = CHAIN.filter((s) => done[s.lab]).length;

  useEffect(() => {
    if (isComplete) {
      log("attack chain complete — full compromise", "error");
      onReveal();
    }
  }, [isComplete, onReveal, log]);

  return (
    <div className="tea-page">
      <Kicker text="Cyber Tea House · Attack Chain" />
      <h2 className="tea-title">Attack chain</h2>
      <p className="tea-sub">
        The labs aren't isolated — they <b>connect</b>. Each step enables the
        next until the whole shop is compromised. Confirm the labs, then watch
        the graph light up.
      </p>

      <div className="tea-chain-meta">
        <span>⛓️ {stepsDone}/{CHAIN.length} links confirmed</span>
        <span>{isComplete ? "✔ Chain complete" : "Complete every link to trigger the critical finding"}</span>
      </div>

      <div className="tea-card">
        <ChainGraph
          steps={CHAIN}
          done={done}
          onNavigate={onNavigate}
          complete={isComplete}
        />
        <div className="tea-graph-legend">
          <span className="tea-legend-dot done" /> confirmed link
          <span className="tea-legend-dot" /> pending
          <span className="tea-legend-dot crit" /> critical
        </div>
        <p className="tea-muted">
          Click any node to jump to its lab. The final node —{" "}
          <b>CRITICAL</b> — only unlocks once every link in the chain is
          confirmed, and it confirms an extra chain finding.
        </p>
      </div>

      {isComplete ? (
        <div className="tea-alert err">
          Chain compromised end to end. The report will show how every step
          built on the last. {"FLAG{ch41n_r34ct3d_th3_5h0p}"}
        </div>
      ) : null}
    </div>
  );
}

const NAV = [
  ["dashboard", "Dashboard", "🏠"],
  ["menu", "Menu", "🍵"],
  ["orders", "Orders", "🧾"],
  ["customers", "Customers", "👥"],
  ["inventory", "Inventory", "📦"],
  ["employees", "Employees", "👨‍🍳"],
  ["feedback", "Feedback", "💬"],
  ["login", "Login", "🔐"],
  ["settings", "Settings", "⚙️"],
  ["admin", "Admin", "🛡️"],
  ["labs", "Labs", "🧪"],
  ["chain", "Attack Chain", "⛓️"],
];

function Page({ page, query, onReveal, onNavigate, session, done, isComplete }) {
  switch (page) {
    case "dashboard":
      return <DashboardPage onNavigate={onNavigate} />;
    case "menu":
      return <MenuPage />;
    case "orders":
      return <OrdersPage query={query} onReveal={onReveal} onNavigate={onNavigate} />;
    case "customers":
      return <CustomersPage onReveal={onReveal} />;
    case "inventory":
      return <InventoryPage onReveal={onReveal} />;
    case "employees":
      return <EmployeesPage onReveal={onReveal} />;
    case "feedback":
      return <FeedbackPage onReveal={onReveal} />;
    case "login":
      return <LoginPage session={session} onReveal={onReveal} />;
    case "settings":
      return <SettingsPage session={session} onReveal={onReveal} />;
    case "admin":
      return <AdminPage session={session} onReveal={onReveal} />;
    case "labs":
      return <LabsPage done={done} onNavigate={onNavigate} />;
    case "chain":
      return (
        <ChainPage
          done={done}
          isComplete={isComplete}
          onReveal={onReveal}
          onNavigate={onNavigate}
        />
      );
    default:
      return null;
  }
}

export default function TeaShop({ onReveal }) {
  return (
    <BrowserFrame domain="cyber-tea.in">
      <TeaInner onReveal={onReveal} />
    </BrowserFrame>
  );
}

const TEA_APP_IDS = LABS.map((l) => l.id);

function TeaInner({ onReveal }) {
  const [raw, setRaw] = useState("https://shop.cyber-tea.in/dashboard");
  const [path, setPath] = useState("/dashboard");
  const { cookies, setCookie, request, log } = useBrowser();
  const { isCaptured } = useHunt();

  useEffect(() => {
    if (!cookies["tea-session"]) setCookie("tea-session", DEFAULT_SESSION);
  }, [cookies, setCookie]);

  const session = cookies["tea-session"] || DEFAULT_SESSION;

  const done = {};
  TEA_APP_IDS.forEach((id) => {
    done[id] = isCaptured("tea", id);
  });
  done["tea-chain"] = isCaptured("tea", "tea-chain");
  const isComplete = CHAIN.every((s) => done[s.lab]);

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
    request("GET", u.pathname, NAV.some(([id]) => id === p) ? 200 : 404);
  };

  const page = path.split("?")[0].split("/")[1] || "dashboard";
  const query = path.includes("?") ? path.slice(path.indexOf("?")) : "";

  return (
    <div className="tea-sp">
      <BrowserChrome url={raw} onNavigate={navigate} editable />
      <div className="tea-shell">
        <header className="tea-topbar">
          <div className="tea-brand">
            <span className="tea-brand-mark">🐺</span>
            <span>
              <b>Cyber Tea House</b>
              <span className="tea-brand-sub">POS Management</span>
            </span>
          </div>
          <nav className="tea-nav">
            {NAV.map(([id, label, icon]) => (
              <button
                key={id}
                className={`tea-tab ${page === id ? "on" : ""}`}
                onClick={() => navigate(`https://shop.cyber-tea.in/${id}`)}
              >
                <span className="tea-tab-icon">{icon}</span>
                {label}
              </button>
            ))}
          </nav>
          <div className="tea-topbar-right">
            <span className="tea-signed">
              {sessionUser(session)} · {sessionRole(session)}
            </span>
            <span className="tea-pill">Sandbox</span>
          </div>
        </header>
        <main className="tea-main">
          <Page
            page={page}
            query={query}
            onReveal={reveal}
            onNavigate={navigate}
            session={session}
            done={done}
            isComplete={isComplete}
          />
          {!NAV.some(([id]) => id === page) ? (
            <div className="tea-page">
              <Kicker text="Cyber Tea House · 404" />
              <h2 className="tea-title">Page not found</h2>
              <p className="tea-sub">{path} does not exist.</p>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
