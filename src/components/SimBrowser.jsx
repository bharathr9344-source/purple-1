import { useState } from "react";

import { matchesAnswer } from "../utils/scoring";
import { hasSim, SQLI_LOGIN_ANSWERS } from "../utils/sim";

function parseUrl(url) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function BrowserChrome({ url, onNavigate, editable }) {
  const [draft, setDraft] = useState(url);

  const submit = (e) => {
    e.preventDefault();
    if (onNavigate) onNavigate(draft);
  };

  return (
    <div className="sim-chrome">
      <div className="sim-dots">
        <span className="sim-dot r" />
        <span className="sim-dot y" />
        <span className="sim-dot g" />
      </div>
      {editable ? (
        <form className="sim-address" onSubmit={submit}>
          <span className="sim-lock">🔒</span>
          <input
            className="sim-url-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck="false"
            aria-label="Address bar — edit the URL"
          />
          <button type="submit" className="sim-go">
            Go
          </button>
        </form>
      ) : (
        <div className="sim-address">
          <span className="sim-lock">🔒</span>
          <span className="sim-url-static">{url}</span>
        </div>
      )}
    </div>
  );
}

const BANNER =
  "⚠️ Simulated vulnerable app for education. No real systems are touched.";

export function Shell({ children }) {
  return (
    <div className="sim-shell">
      <div className="sim-banner">{BANNER}</div>
      <div className="sim-window">{children}</div>
    </div>
  );
}

export function InvoiceBrowser({ hunt, onReveal }) {
  const invoices = {
    1040: { name: "Priya Nair", amount: "$1,204.00", note: "utilities" },
    1041: { name: "Marcus Reed", amount: "$48,290.00", note: "FLAG{n0_0wn3rsh1p_ch3ck}" },
    1042: { name: "You", amount: "$249.00", note: "Your invoice" },
    1043: { name: "Sofia Lind", amount: "$3,117.50", note: "utilities" },
  };

  const [raw, setRaw] = useState(
    "https://novabank.app/account/invoice?id=1042"
  );
  const [current, setCurrent] = useState("1042");
  const [error, setError] = useState(false);

  const go = (draft) => {
    const u = parseUrl(draft);
    if (!u) {
      setError(true);
      setCurrent(null);
      return;
    }
    const id = u.searchParams.get("id");
    setRaw(draft);
    setCurrent(id);
    setError(false);
    if (hunt && id === "1041") onReveal("FLAG{n0_0wn3rsh1p_ch3ck}");
  };

  const invoice = invoices[current];

  return (
    <Shell>
      <BrowserChrome url={raw} onNavigate={go} editable />
      <div className="sim-site bank">
        <header className="sim-site-head">
          <span className="sim-logo">◆ NovaBank</span>
          <nav className="sim-nav">
            <a href="#invoice" onClick={(e) => e.preventDefault()}>
              My Invoice
            </a>
            <a href="#transfer" onClick={(e) => e.preventDefault()}>
              Transfer
            </a>
            <a href="#accounts" onClick={(e) => e.preventDefault()}>
              Accounts
            </a>
          </nav>
          <span className="sim-user">Welcome, you@novabank.app</span>
        </header>

        <div className="sim-body">
          <div className="sim-main">
            {error ? (
              <div className="sim-alert err">
                Invoice not found. Check the id parameter.
              </div>
            ) : invoice ? (
              <div className="sim-invoice">
                <h4>Invoice #{current}</h4>
                <p className="sim-muted">Issued to: {invoice.name}</p>
                <p className="sim-amount">{invoice.amount}</p>
                <p className="sim-note">{invoice.note}</p>
                <div className="sim-muted">
                  Account number: <b className="sim-acct">{current}</b>
                </div>
              </div>
            ) : (
              <div className="sim-alert err">Invoice not found.</div>
            )}
          </div>

          <aside className="sim-side">
            <p className="sim-side-title">Recent invoices</p>
            {Object.entries(invoices).map(([id, inv]) => (
              <div
                key={id}
                className={`sim-acct-row ${current === id ? "on" : ""}`}
              >
                <span>#{id}</span>
                <span>{inv.name}</span>
              </div>
            ))}
            <p className="sim-muted sim-hint">
              Invoices are issued sequentially…
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

export function SqliLogin({ recon, answers, onLoggedIn = () => {} }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [status, setStatus] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (recon) {
      setStatus({ ok: true, text: "Sign in disabled for maintenance — but notice the footer." });
      return;
    }
    if (matchesAnswer(user, answers)) {
      setStatus({
        ok: true,
        text: "Query returned 1 row → Logged in as admin 🎉",
      });
      onLoggedIn(user);
    } else {
      setStatus({ ok: false, text: "Invalid credentials. Try again." });
    }
  };

  return (
    <Shell>
      <BrowserChrome url="https://shoplift.app/login" />
      <div className="sim-site shop">
        <header className="sim-site-head">
          <span className="sim-logo">🛍 ShopLift</span>
          <nav className="sim-nav">
            <a href="#products" onClick={(e) => e.preventDefault()}>
              Products
            </a>
            <a href="#cart" onClick={(e) => e.preventDefault()}>
              Cart
            </a>
            <a href="#login" onClick={(e) => e.preventDefault()}>
              Sign in
            </a>
          </nav>
        </header>

        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={submit}>
              <h4>Sign in to ShopLift</h4>
              <label>
                Username
                <input
                  className="sim-field"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="username"
                  spellCheck="false"
                  autoComplete="off"
                />
              </label>
              <label>
                Password
                <input
                  className="sim-field"
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="password"
                  autoComplete="off"
                />
              </label>
              <button type="submit" className="sim-button">
                Sign in
              </button>
              {status ? (
                <div className={`sim-alert ${status.ok ? "ok" : "err"}`}>
                  {status.text}
                </div>
              ) : null}
              {!recon ? (
                <pre className="sim-code">{`SELECT * FROM users
  WHERE username='${user || "…"}' AND password='${pass || "…"}'`}</pre>
              ) : null}
            </form>
          </div>
        </div>

        <footer className="sim-footer">
          © 2025 ShopLift — Powered by MySQL 8.0 Community
        </footer>
      </div>
    </Shell>
  );
}

export function SqliSearch({ onReveal }) {
  const [q, setQ] = useState("");
  const [result, setResult] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (/union/i.test(q)) {
      setResult({
        ok: true,
        rows: [
          { id: 1, name: "admin", hash: "FLAG{7h3y_trust3d_th3_1nput}" },
        ],
        text: "3 columns matched — dumped the users table.",
      });
      onReveal("FLAG{7h3y_trust3d_th3_1nput}");
    } else {
      setResult({ ok: false, rows: [], text: "No products found." });
    }
  };

  return (
    <Shell>
      <BrowserChrome url="https://shoplift.app/search?q=iphone" />
      <div className="sim-site shop">
        <header className="sim-site-head">
          <span className="sim-logo">🛍 ShopLift</span>
          <nav className="sim-nav">
            <a href="#products" onClick={(e) => e.preventDefault()}>
              Products
            </a>
            <a href="#cart" onClick={(e) => e.preventDefault()}>
              Cart
            </a>
            <a href="#login" onClick={(e) => e.preventDefault()}>
              Sign in
            </a>
          </nav>
        </header>

        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={submit}>
              <h4>Search products</h4>
              <div className="sim-search-row">
                <input
                  className="sim-field"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="e.g. 1' UNION SELECT 1, username, password FROM users#"
                  spellCheck="false"
                  autoComplete="off"
                />
                <button type="submit" className="sim-button">
                  Search
                </button>
              </div>
              {result ? (
                <div
                  className={`sim-alert ${result.ok ? "ok" : "err"}`}
                >
                  {result.text}
                </div>
              ) : null}
              {result?.ok ? (
                <table className="sim-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Password Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.name}</td>
                        <td className="sim-flag">{row.hash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
              <pre className="sim-code">{`SELECT id, name, price FROM products
  WHERE name LIKE '%${q || "…"}'`}</pre>
            </form>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function ReqLog({ lines, kind }) {
  return (
    <Shell>
      <BrowserChrome url="https://console.cyberwolf.ctf/activity" />
      <div className="sim-site log-site">
        <header className="sim-site-head">
          <span className="sim-logo">🐺 Cyber Wolf Console</span>
        </header>
        <div className="sim-body">
          <div className={`sim-log ${kind}`}>
            {lines.map((line, i) => (
              <pre key={i}>{line}</pre>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

export default function SimBrowser({ room, step, onReveal, onLoggedIn }) {
  if (!hasSim(room, step)) return null;

  const key = `${room.id}.${step.id}`;
  switch (key) {
    case "idor.s1":
      return <InvoiceBrowser hunt={false} onReveal={onReveal} />;
    case "idor.s2":
      return <InvoiceBrowser hunt onReveal={onReveal} />;
    case "idor.s3":
      return (
        <ReqLog
          kind="warn"
          lines={[
            "GET /account/invoice?id=1042 → 200 OK (you)",
            "GET /account/invoice?id=1041 → 200 OK (MARCUS REED)",
            "→ no ownership check on the server",
            "→ horizontal privilege escalation",
          ]}
        />
      );
    case "idor.s4":
      return (
        <ReqLog
          kind="bad"
          lines={[
            "RESULT: sequential ids + no authorization checks",
            "→ every customer's invoice readable by any user",
            "→ mass unauthorized disclosure of financial data",
            "CVSS 6.5 · OWASP A01:2025 Broken Access Control",
          ]}
        />
      );
    case "sqli.s1":
      return (
        <SqliLogin
          recon
          answers={step.answers}
          onLoggedIn={() => {}}
        />
      );
    case "sqli.s2":
      return (
        <SqliLogin
          answers={SQLI_LOGIN_ANSWERS}
          onLoggedIn={onLoggedIn}
        />
      );
    case "sqli.s3":
      return <SqliSearch onReveal={onReveal} />;
    case "sqli.s4":
      return (
        <ReqLog
          kind="bad"
          lines={[
            "POST /login → auth bypass via ' OR '1'='1",
            "GET  /search?q=UNION SELECT … → users table dumped",
            "→ authentication bypass escalates to full DB takeover",
            "CVSS 9.8 · OWASP A05:2025 Injection",
          ]}
        />
      );
    default:
      return null;
  }
}
