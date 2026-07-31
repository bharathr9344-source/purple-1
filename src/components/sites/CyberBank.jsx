import { useState } from "react";

import { BrowserChrome, Shell } from "../SimBrowser";

const ACCOUNTS = {
  1001: {
    name: "Alice Okafor",
    role: "Customer",
    balance: 4820.5,
    transactions: [
      ["2025-06-02", "Salary · NovaCorp", "+$4,200.00"],
      ["2025-06-01", "Coffee · Bean St.", "-$6.40"],
      ["2025-05-30", "Rent", "-$1,150.00"],
    ],
  },
  1002: {
    name: "Priya Nair",
    role: "Customer",
    balance: 1204.0,
    transactions: [
      ["2025-06-01", "Utilities", "-$88.20"],
      ["2025-05-28", "Refund · TechStore", "+$129.99"],
    ],
  },
  1003: {
    name: "Marcus Reed",
    role: "Customer",
    balance: 48290.0,
    transactions: [
      ["2025-06-03", "Invoice #8841", "+$48,290.00"],
      ["2025-05-22", "Wire · Zurich", "-$12,000.00"],
      ["2025-04-15", "Note to self", "FLAG{acc0unt_3num}"],
    ],
  },
  1004: {
    name: "Sofia Lind",
    role: "Customer",
    balance: 3117.5,
    transactions: [
      ["2025-05-19", "Utilities", "-$74.10"],
      ["2025-05-02", "Freelance payout", "+$1,900.00"],
    ],
  },
  1005: {
    name: "Dev Patel",
    role: "Customer",
    balance: 765.25,
    transactions: [["2025-06-02", "Groceries", "-$132.66"]],
  },
  1006: {
    name: "Elena Rossi",
    role: "Customer",
    balance: 15800.0,
    transactions: [
      ["2025-05-30", "Mortgage auto-pay", "-$1,900.00"],
      ["2025-05-12", "Transfer in", "+$2,500.00"],
    ],
  },
};

const STAFF = [
  ["Maya Chen", "Chief Executive Officer"],
  ["Tom Brauer", "Chief Information Security Officer"],
  ["Grace Odum", "Head of Engineering"],
  ["Felix Maran", "DevOps Engineer"],
  ["Ruth Kwan", "Support Manager"],
];

function StatementPage({ account, onOpen, onReveal }) {
  const acc = ACCOUNTS[account];
  return (
    <div>
      <div className="sim-panel-head">
        <h4>Statements</h4>
        <span className="sim-muted">Account #{account}</span>
      </div>
      {acc ? (
        <>
          <div className="sim-balance-row">
            <div>
              <span className="sim-muted">Account holder</span>
              <b>{acc.name}</b>
            </div>
            <div className="sim-balance">
              <span className="sim-muted">Balance</span>
              <b>${acc.balance.toLocaleString()}</b>
            </div>
          </div>
          <table className="sim-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {acc.transactions.map(([d, desc, amt], i) => (
                <tr key={i}>
                  <td>{d}</td>
                  <td>
                    {desc}
                    {desc.startsWith("FLAG") ? (
                      <span className="sim-flag"> {desc}</span>
                    ) : (
                      ""
                    )}
                  </td>
                  <td className={amt.startsWith("+") ? "pos" : "neg"}>{amt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {account !== 1001 ? (
            <div className="sim-alert warn">
              ⚠️ You are viewing another customer's statement. There is no
              ownership check on the server.
            </div>
          ) : null}
        </>
      ) : (
        <div className="sim-alert err">Account {account} not found.</div>
      )}
      <div className="sim-form sim-inline-form">
        <label className="sim-muted">Open account #</label>
        <input
          className="sim-field"
          type="number"
          value={account}
          onChange={(e) => onOpen(e.target.value)}
        />
        <button className="sim-button ghost" onClick={() => onReveal()}>
          Refresh
        </button>
      </div>
      <p className="sim-muted sim-hint">
        Statements load by sequential account number — e.g.{" "}
        <code>?account=1003</code> in the address bar.
      </p>
    </div>
  );
}

function TransfersPage({ balance, onReveal }) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailed, setEmailed] = useState(false);

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Transfers</h4>
        <span className="sim-muted">Available: ${balance.toLocaleString()}</span>
      </div>
      <form
        className="sim-form"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <label className="sim-muted">Beneficiary account</label>
        <input className="sim-field" value="1337" readOnly />
        <label className="sim-muted">Amount</label>
        <input className="sim-field" value="$2,500.00" readOnly />
        <button type="submit" className="sim-button" disabled>
          Transfer is locked
        </button>
        <p className="sim-muted sim-hint">
          Transfers require re-authentication… but there's an unread email in
          your inbox about an "exclusive reward".
        </p>
      </form>

      <div className="sim-email">
        <div className="sim-email-head">
          <b>📧 1 unread message · CyberBank Rewards</b>
          <button
            className="sim-button ghost"
            onClick={() => setEmailOpen((o) => !o)}
          >
            {emailOpen ? "Close email" : "Open email"}
          </button>
        </div>
        {emailOpen ? (
          <div className="sim-email-body">
            <p>
              <b>From:</b> rewards@cyberbank.app
            </p>
            <p>
              <b>Subject:</b> Claim your free gift 🎁
            </p>
            <p className="sim-muted">
              Congratulations! Click the image below to verify your reward
              eligibility.
            </p>
              {emailed ? (
              <div className="sim-alert err">
                <b>CSRF triggered.</b> The "image" was a request that posts a
                transfer of $2,500 to account 1337 with your session cookies —
                and no CSRF token was required. {"FLAG{csrf_n0_t0k3n}"}
              </div>
            ) : (
              <button
                className="sim-button"
                onClick={() => {
                  setEmailed(true);
                  onReveal();
                }}
              >
                🖼 Render email images
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MessagesPage({ onReveal }) {
  const [text, setText] = useState("");
  const [posted, setPosted] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const evil = /<script|onerror=/i.test(text);
    setPosted({ text, evil });
    if (evil) onReveal();
    setText("");
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Support messages</h4>
        <span className="sim-muted">Thread #8841 · Staff sees raw HTML</span>
      </div>
      <div className="sim-thread">
        <div className="sim-msg staff">
          <b>Ruth (Support)</b>
          <p>Hi Alice — we're on it. I've opened your dispute ticket.</p>
        </div>
        <div className="sim-msg staff">
          <b>Ruth (Support)</b>
          <p>Let us know if anything else comes up.</p>
        </div>
        {posted ? (
          <div className="sim-msg you">
            <b>You</b>
            <p>{posted.text}</p>
          </div>
        ) : null}
      </div>
      {posted?.evil ? (
        <div className="sim-alert err">
          Your message was stored and rendered as HTML for staff — the payload
          executed in their browser and exfiltrated account data.{" "}
          {"FLAG{bank_st0r3d_xss}"}
        </div>
      ) : null}
      <form className="sim-form" onSubmit={submit}>
        <h4>Reply to support</h4>
        <textarea
          className="sim-field sim-area"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="3"
          placeholder="Type a reply…"
        />
        <button type="submit" className="sim-button">
          Send message
        </button>
        <p className="sim-muted sim-hint">
          Messages are stored and shown to staff as raw HTML.
        </p>
      </form>
    </div>
  );
}

function SessionPage({ session, setSession, onReveal }) {
  const [token, setToken] = useState(session.cookie);
  const [status, setStatus] = useState(null);

  const save = (e) => {
    e.preventDefault();
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const admin = payload.role === "admin";
      setSession((s) => ({ ...s, role: payload.role, user: payload.user }));
      setStatus(
        admin
          ? {
              ok: true,
              text: "Session accepted as admin — Admin Console unlocked. FLAG{c00k13_f0rg3ry}",
            }
          : { ok: true, text: `Session token saved as ${payload.user} (${payload.role}).` }
      );
      if (admin) onReveal();
    } catch {
      setStatus({ ok: false, text: "Could not decode token — bad format." });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Session settings</h4>
        <span className="sim-muted">You are signed in as {session.user}</span>
      </div>
      <p className="sim-muted">
        Your whole session lives in this cookie. Decode it — it's just base64
        JSON with no signature.
      </p>
      <form className="sim-form" onSubmit={save}>
        <label className="sim-muted">Session cookie</label>
        <textarea
          className="sim-field sim-area sim-mono"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows="3"
          spellCheck="false"
        />
        <button
          type="button"
          className="sim-button ghost"
          onClick={() =>
            setToken(
              `${btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${btoa(
                JSON.stringify({ user: "alice", role: "admin" })
              )}.c2lnbmF0dXJl`
            )
          }
        >
          🔧 Forge an admin cookie
        </button>
        <button type="submit" className="sim-button">
          Save token
        </button>
      </form>
      {status ? (
        <div className={`sim-alert ${status.ok ? "ok" : "err"}`}>{status.text}</div>
      ) : null}
      <pre className="sim-code">{`payload = atob(cookie) → ${atob(
        session.cookie.split(".")[1]
      )}`}</pre>
    </div>
  );
}

function AdminPage() {
  return (
    <div>
      <div className="sim-panel-head">
        <h4>Admin Console</h4>
        <span className="sim-badge admin">ROLE: admin</span>
      </div>
      <p className="sim-muted">
        You forged the cookie and unlocked staff-only tools. Employee directory:
      </p>
      <table className="sim-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Title</th>
            <th>Access</th>
          </tr>
        </thead>
        <tbody>
          {STAFF.map(([n, t]) => (
            <tr key={n}>
              <td>{n}</td>
              <td>{t}</td>
              <td>Full</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="sim-alert ok">
        Session trust means privilege: every "admin" area trusts whatever the
        cookie says.
      </div>
    </div>
  );
}

function DevApiPage({ onReveal }) {
  const [origin, setOrigin] = useState("https://cyberbank.app");
  const [status, setStatus] = useState(null);

  const fetchBalance = (e) => {
    e.preventDefault();
    const evil = !origin.startsWith("https://cyberbank.app");
    setStatus(
      evil
        ? {
            ok: true,
            text: `Origin: ${origin} → server reflects "Access-Control-Allow-Origin: ${origin}" + credentials. Response readable: { balance: 4820.50 } → FLAG{bank_c0rs_bug}`,
          }
        : { ok: false, text: `Origin ${origin} allowed (same-site). Response readable only here.` }
    );
    if (evil) onReveal();
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Developer API Console</h4>
        <span className="sim-muted">balance endpoint · docs</span>
      </div>
      <p className="sim-muted">
        Internal tool for our partners. It calls the balance API and prints the
        result — watch what the server allows across origins.
      </p>
      <form className="sim-form" onSubmit={fetchBalance}>
        <label className="sim-muted">Origin</label>
        <input
          className="sim-field"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          spellCheck="false"
        />
        <button type="submit" className="sim-button">
          Fetch balance
        </button>
      </form>
      {status ? (
        <div className={`sim-alert ${status.ok ? "ok" : "err"}`}>{status.text}</div>
      ) : null}
      <p className="sim-muted sim-hint">
        Try an attacker origin like <code>https://evil.example.com</code>.
      </p>
    </div>
  );
}

function RedirectPage({ next, setNext, onReveal }) {
  const evil = next && !next.startsWith("https://login.cyberbank.app/");
  const go = (e) => {
    e.preventDefault();
    if (evil) onReveal();
  };
  return (
    <div>
      <div className="sim-panel-head">
        <h4>You're leaving cyberbank.app…</h4>
        <span className="sim-muted">Sponsored partner offer</span>
      </div>
      <p className="sim-muted">
        We're sending you to our trusted partners to claim your exclusive
        reward. The destination comes from the <code>next</code> parameter.
      </p>
      <form className="sim-form" onSubmit={go}>
        <label className="sim-muted">Continue to</label>
        <input
          className="sim-field"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          spellCheck="false"
        />
        <button type="submit" className="sim-button">
          Continue →
        </button>
      </form>
      {evil ? (
        <div className="sim-alert warn">
          ⚠️ <code>{next}</code> is not on cyberbank.app — the app would happily
          redirect your users to a phishing site. Try it: continue to confirm.{" "}
          <span className="sim-muted">{"FLAG{bank_0p3n_r3d1r}"}</span>
        </div>
      ) : null}
    </div>
  );
}

function NotFound({ path }) {
  return (
    <div>
      <div className="sim-alert err">404 — {path || "/unknown"} not found.</div>
      <p className="sim-muted sim-hint">
        Try /dashboard, /statements, /transfers, /messages, /session,
        /dev-api or /admin.
      </p>
    </div>
  );
}

export default function CyberBank({ onReveal }) {
  const [raw, setRaw] = useState("https://cyberbank.app/dashboard");
  const [path, setPath] = useState("/dashboard");
  const [account, setAccount] = useState("1001");
  const [session, setSession] = useState({
    user: "alice",
    role: "customer",
    cookie: `${btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${btoa(
      JSON.stringify({ user: "alice", role: "customer" })
    )}.c2lnbmF0dXJl`,
  });
  const [next, setNext] = useState("https://login.cyberbank.app/dashboard");

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
    let p = u.pathname;
    if (!p.startsWith("/")) p = `/${p}`;
    setPath(p);
    const acc = u.searchParams.get("account");
    if (p === "/statements" && acc) {
      setAccount(acc);
      if (acc !== "1001") reveal("bank-statement", "FLAG{acc0unt_3num}");
    }
  };

  const page = path.split("/")[1] || "dashboard";

  return (
    <Shell>
      <BrowserChrome url={raw} onNavigate={navigate} editable />
      <div className="sim-site bank bank-site">
        <header className="sim-site-head">
          <span className="sim-logo">◆ CyberBank</span>
          <nav className="sim-nav">
            {[
              ["dashboard", "Dashboard"],
              ["statements", "Statements"],
              ["transfers", "Transfers"],
              ["messages", "Messages"],
              ["session", "Security"],
              ["dev-api", "Developer API"],
              ...(session.role === "admin" ? [["admin", "Admin"]] : []),
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={page === id ? "on" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`https://cyberbank.app/${id}`);
                }}
              >
                {label}
                {id === "admin" ? <span className="sim-badge admin">ADMIN</span> : ""}
              </a>
            ))}
          </nav>
          <span className="sim-user">
            {session.user} · {session.role}
          </span>
        </header>

        <div className="sim-body">
          <div className="sim-main">
            {page === "dashboard" ? (
              <>
                <div className="sim-hello">
                  <p className="eyebrow">WELCOME BACK, {session.user.toUpperCase()}</p>
                  <h3>Checking account</h3>
                  <div className="sim-balance big">
                    <span className="sim-muted">Available balance</span>
                    <b>${ACCOUNTS[1001].balance.toLocaleString()}</b>
                  </div>
                </div>
                <div className="sim-stat-grid">
                  <div className="sim-stat">
                    <span className="sim-muted">Recent transactions</span>
                    <table className="sim-table">
                      <tbody>
                        {ACCOUNTS[1001].transactions.map(([d, desc, amt], i) => (
                          <tr key={i}>
                            <td>{d}</td>
                            <td>{desc}</td>
                            <td className={amt.startsWith("+") ? "pos" : "neg"}>
                              {amt}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="sim-stat card-promo">
                    <p className="eyebrow">SPONSORED</p>
                    <h4>🎁 Exclusive partner offer</h4>
                    <p className="sim-muted">
                      Earn 5% cashback with our verified partner.
                    </p>
                    <button
                      className="sim-button ghost"
                      onClick={() => navigate(`https://cyberbank.app/redirect?next=${encodeURIComponent(next)}`)}
                    >
                      View offer →
                    </button>
                  </div>
                </div>
              </>
            ) : null}
            {page === "statements" ? (
              <StatementPage
                account={account}
                onOpen={(a) => {
                  setAccount(a);
                  if (a !== "1001") reveal("bank-statement", "FLAG{acc0unt_3num}");
                }}
                onReveal={() => reveal("bank-statement", "FLAG{acc0unt_3num}")}
              />
            ) : null}
            {page === "transfers" ? (
              <TransfersPage
                balance={ACCOUNTS[1001].balance}
                onReveal={() => reveal("bank-csrf", "FLAG{csrf_n0_t0k3n}")}
              />
            ) : null}
            {page === "messages" ? (
              <MessagesPage onReveal={() => reveal("bank-xss", "FLAG{bank_st0r3d_xss}")} />
            ) : null}
            {page === "session" ? (
              <SessionPage
                session={session}
                setSession={setSession}
                onReveal={() => reveal("bank-cookie", "FLAG{c00k13_f0rg3ry}")}
              />
            ) : null}
            {page === "admin" ? <AdminPage /> : null}
            {page === "dev-api" ? (
              <DevApiPage onReveal={() => reveal("bank-cors", "FLAG{bank_c0rs_bug}")} />
            ) : null}
            {page === "redirect" ? (
              <RedirectPage
                next={next}
                setNext={setNext}
                onReveal={() => reveal("bank-redirect", "FLAG{bank_0p3n_r3d1r}")}
              />
            ) : null}
            {!["dashboard", "statements", "transfers", "messages", "session", "admin", "dev-api", "redirect"].includes(page) ? (
              <NotFound path={path} />
            ) : null}
          </div>
        </div>

        <footer className="sim-footer">
          © 2025 CyberBank — Member FDIC. All apps here are simulated; nothing
          leaves your browser.
        </footer>
      </div>
    </Shell>
  );
}
