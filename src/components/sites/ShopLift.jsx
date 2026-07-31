import { useEffect, useState } from "react";

import { useBrowser } from "../browserCtx";
import BrowserFrame from "../BrowserFrame";
import { BrowserChrome, Shell } from "../SimBrowser";

const DEFAULT_SESSION = `${btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${btoa(
  JSON.stringify({ user: "alice", role: "user", exp: 1999999999 })
)}.c2lnbmF0dXJl`;

function decodeSession(cookie) {
  try {
    const payload = JSON.parse(atob(cookie.split(".")[1]));
    return { user: payload.user || "alice", role: payload.role || "user" };
  } catch {
    return { user: "alice", role: "user" };
  }
}

const PRODUCTS = [
  ["iPhone 16 Pro", "$1,199"],
  ["Noise-Cancelling Headphones", "$249"],
  ["Mechanical Keyboard", "$129"],
  ["4K Webcam", "$89"],
];

const INVOICES = {
  1040: { name: "Priya Nair", amount: "$1,204.00", note: "utilities" },
  1041: { name: "Marcus Reed", amount: "$48,290.00", note: "FLAG{n0_0wn3rsh1p_ch3ck}" },
  1042: { name: "You", amount: "$249.00", note: "Your invoice" },
  1043: { name: "Sofia Lind", amount: "$3,117.50", note: "utilities" },
};

function HomePage({ onNavigate }) {
  return (
    <div>
      <div className="sim-hello">
        <p className="eyebrow">SHOPLIFT MARKETPLACE</p>
        <h3>Everything you never needed, shipped fast.</h3>
        <p className="sim-muted">
          Browsing as a guest. Some pages need a sign-in — good luck finding the
          staff-only corners.
        </p>
      </div>
      <div className="sim-product-grid">
        {PRODUCTS.map(([n, p]) => (
          <div className="sim-product" key={n}>
            <span className="sim-product-emoji">📦</span>
            <b>{n}</b>
            <span className="sim-muted">{p}</span>
          </div>
        ))}
      </div>
      <div className="card-promo" style={{ marginTop: 18 }}>
        <p className="eyebrow">WELCOME DEAL</p>
        <p className="sim-muted">
          New customer? Claim 10% off through our partners. Sign in to unlock
          support, invoices, and the seller tools.
        </p>
        <button className="sim-button ghost" onClick={() => onNavigate("login")}>
          Sign in →
        </button>
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
    log(`search?q=${q || ""}`, "info");
    if (/union/i.test(q)) {
      setResult({ ok: true, text: "3 columns matched — dumped the users table." });
      log("UNION payload detected in search → users table dumped", "error");
      onReveal();
    } else {
      setResult({ ok: false, text: "No products found." });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Search products</h4>
        <span className="sim-muted">powered by MySQL 8.0</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <div className="sim-search-row">
          <input
            className="sim-field"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. 1' UNION SELECT 1, username, password FROM users#"
            spellCheck="false"
            autoComplete="off"
          />
          <button type="submit" className="sim-button">Search</button>
        </div>
      </form>
      {result ? (
        <div className={`sim-alert ${result.ok ? "ok" : "err"}`}>{result.text}</div>
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
            <tr>
              <td>1</td>
              <td>admin</td>
              <td className="sim-flag">{"FLAG{7h3y_trust3d_th3_1nput}"}</td>
            </tr>
          </tbody>
        </table>
      ) : null}
      <pre className="sim-code">{`SELECT id, name, price FROM products
  WHERE name LIKE '%${q || "…"}'`}</pre>
    </div>
  );
}

function LoginPage({ onReveal }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [status, setStatus] = useState(null);
  const { request, log } = useBrowser();

  const submit = (e) => {
    e.preventDefault();
    request("POST", "/api/login", 200);
    log(`login attempt: user=${user || ""}`, user.includes("' OR '1'='1") ? "error" : "info");
    if (user.includes("' OR '1'='1")) {
      setStatus({ ok: true, text: "Query returned 1 row → Logged in as admin 🎉" });
      onReveal();
    } else {
      setStatus({ ok: false, text: "Invalid credentials. Try again." });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Sign in to ShopLift</h4>
        <span className="sim-muted">shoplift.app/login</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <label className="sim-muted">Username</label>
        <input
          className="sim-field"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="username"
          spellCheck="false"
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
      <pre className="sim-code">{`SELECT * FROM users
  WHERE username='${user || "…"}' AND password='${pass || "…"}'`}</pre>
    </div>
  );
}

function GuestbookPage({ onReveal }) {
  const [text, setText] = useState("");
  const [comments, setComments] = useState([
    { id: 1, user: "mod", body: "Welcome to the Vibe guestbook! Be nice." },
  ]);
  const [status, setStatus] = useState(null);
  const { request, log } = useBrowser();

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    request("POST", "/api/guestbook", 201);
    setComments((c) => [...c, { id: Date.now(), user: "anonymous", body: text }]);
    if (/<script/i.test(text)) {
      setStatus({ ok: true, injected: true, text: "alert('pwned') executed → cookie sent to attacker." });
      log("stored XSS executed for every visitor", "error");
      onReveal();
    } else {
      setStatus({ ok: true, injected: false, text: "Comment posted." });
    }
    setText("");
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Vibe guestbook</h4>
        <span className="sim-muted">raw HTML rendering</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <textarea
          className="sim-field sim-area"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="2"
          placeholder="Leave a comment…"
        />
        <button type="submit" className="sim-button">Post</button>
      </form>
      {status ? (
        <div className={`sim-alert ${status.injected ? "err" : "ok"}`}>{status.text}</div>
      ) : null}
      <div className="vibe-comments">
        {comments.map((c) => (
          <div className="vibe-comment" key={c.id}>
            <b>{c.user}</b>
            <p>{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolsPage({ page, onReveal }) {
  if (page === "ping") {
    return <PingTool onReveal={() => onReveal("cmd-ping", "FLAG{p1ng_3x3c_4rby}")} />;
  }
  if (page === "docs") {
    return <DocsViewer onReveal={() => onReveal("path-traversal", "FLAG{d0t_d0t_5la5h}")} />;
  }
  if (page === "fetch") {
    return <FetchTool onReveal={() => onReveal("ssrf", "FLAG{1n73rn4l_f3tch}")} />;
  }
  if (page === "upload") {
    return <UploadTool onReveal={() => onReveal("upload", "FLAG{up10ad_4nd_3x3c}")} />;
  }
  if (page === "greet") {
    return <GreetTool onReveal={() => onReveal("ssti", "FLAG{sst1_t3mpl4t3}")} />;
  }
  if (page === "import") {
    return <ImportTool onReveal={() => onReveal("xxe", "FLAG{xxe_f1le_r3ad}")} />;
  }
  return null;
}

function PingTool({ onReveal }) {
  const [target, setTarget] = useState("");
  const [out, setOut] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (/;|&&/i.test(target)) {
      setOut([
        "PING " + (target || "…"),
        "uid=0(root) gid=0(root) groups=0(root) — FLAG{p1ng_3x3c_4rby}",
      ]);
      onReveal();
    } else {
      setOut(["PING " + (target || "…"), "1 packets transmitted, 1 received, 0% loss"]);
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>NetPing diagnostics</h4>
        <span className="sim-muted">admin tool</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <div className="sim-search-row">
          <input
            className="sim-field"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="host — try ; whoami"
            spellCheck="false"
            autoComplete="off"
          />
          <button type="submit" className="sim-button">Ping</button>
        </div>
      </form>
      {out ? (
        <div className="sim-log bad">
          {out.map((l, i) => (
            <pre key={i}>{l}</pre>
          ))}
        </div>
      ) : null}
      <pre className="sim-code">{`ping -c 4 ${target || "…"}`}</pre>
    </div>
  );
}

function DocsViewer({ onReveal }) {
  const [file, setFile] = useState("/var/www/docs/README.txt");
  const [out, setOut] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (file.includes("..")) {
      setOut({
        text: "root:x:0:0:root:/root:/bin/bash — FLAG{d0t_d0t_5la5h}",
        evil: true,
      });
      onReveal();
    } else {
      setOut({ text: "Document contents (simulated). No flags here.", evil: false });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>DocVault file viewer</h4>
        <span className="sim-muted">reads files under /var/www/docs/</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <div className="sim-search-row">
          <input
            className="sim-field"
            value={file}
            onChange={(e) => setFile(e.target.value)}
            spellCheck="false"
          />
          <button type="submit" className="sim-button">Open</button>
        </div>
      </form>
      {out ? (
        <div className={`sim-alert ${out.evil ? "err" : "ok"}`}>{out.text}</div>
      ) : null}
    </div>
  );
}

function FetchTool({ onReveal }) {
  const [url, setUrl] = useState("");
  const [out, setOut] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (/file:|169\.254|localhost/i.test(url)) {
      setOut({ evil: true, text: "Fetched internal resource with the server's identity — FLAG{1n73rn4l_f3tch}" });
      onReveal();
    } else {
      setOut({ evil: false, text: `Fetched ${url || "…"} → 200 OK` });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>ProxyFetch URL checker</h4>
        <span className="sim-muted">the server makes the request</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <div className="sim-search-row">
          <input
            className="sim-field"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://… or file:///etc/passwd"
            spellCheck="false"
          />
          <button type="submit" className="sim-button">Fetch</button>
        </div>
      </form>
      {out ? (
        <div className={`sim-alert ${out.evil ? "err" : "ok"}`}>{out.text}</div>
      ) : null}
    </div>
  );
}

function UploadTool({ onReveal }) {
  const [file, setFile] = useState("");
  const [out, setOut] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (file.endsWith(".php")) {
      setOut({ evil: true, text: "shell.php uploaded and executed — FLAG{up10ad_4nd_3x3c}" });
      onReveal();
    } else {
      setOut({ evil: false, text: `${file || "file"} uploaded to /uploads.` });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>PicDrop upload</h4>
        <span className="sim-muted">only the front end checks extensions</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <input
          className="sim-field"
          value={file}
          onChange={(e) => setFile(e.target.value)}
          placeholder="filename — try shell.php"
          spellCheck="false"
        />
        <button type="submit" className="sim-button">Upload</button>
      </form>
      {out ? (
        <div className={`sim-alert ${out.evil ? "err" : "ok"}`}>{out.text}</div>
      ) : null}
    </div>
  );
}

function GreetTool({ onReveal }) {
  const [name, setName] = useState("");
  const [out, setOut] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const n = name || "guest";
    if (n.includes("{{7*7}}")) {
      setOut({ evil: true, text: `Hello ${n.replace("{{7*7}}", "49")}` });
      onReveal();
    } else {
      setOut({ evil: false, text: `Hello ${n}!` });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>TemplateCloud greeting</h4>
        <span className="sim-muted">render("Hello " + name + "!")</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <div className="sim-search-row">
          <input
            className="sim-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name — try {{7*7}}"
            spellCheck="false"
          />
          <button type="submit" className="sim-button">Render</button>
        </div>
      </form>
      {out ? (
        <div className={`sim-alert ${out.evil ? "err" : "ok"}`}>{out.text}</div>
      ) : null}
    </div>
  );
}

function ImportTool({ onReveal }) {
  const [xml, setXml] = useState(
    `<?xml version="1.0"?>\n<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>\n<user><name>&xxe;</name></user>`
  );
  const [out, setOut] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (xml.includes("<!ENTITY") && xml.includes("SYSTEM")) {
      setOut({ evil: true, text: "Parsed! Name resolved to root:x:0:0:root — FLAG{xxe_f1le_r3ad}" });
      onReveal();
    } else {
      setOut({ evil: false, text: "Parsed successfully. Name: guest." });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>MegaCorp import API</h4>
        <span className="sim-muted">XML import</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <textarea
          className="sim-field sim-area sim-mono"
          value={xml}
          onChange={(e) => setXml(e.target.value)}
          rows="6"
          spellCheck="false"
        />
        <button type="submit" className="sim-button">Parse XML</button>
      </form>
      {out ? (
        <div className={`sim-alert ${out.evil ? "err" : "ok"}`}>{out.text}</div>
      ) : null}
    </div>
  );
}

function InvoicesPage({ onReveal }) {
  const [raw, setRaw] = useState("https://shoplift.app/account/invoice?id=1042");
  const [id, setId] = useState("1042");
  const [err, setErr] = useState(false);
  const { request, log } = useBrowser();

  const go = (draft) => {
    let u;
    try {
      u = new URL(draft);
    } catch {
      return;
    }
    const i = u.searchParams.get("id");
    setRaw(draft);
    setId(i);
    setErr(!INVOICES[i]);
    request("GET", `/api/invoices?id=${i}`, i === "1041" ? 200 : 200);
    log(`invoice id=${i} → shown to session (no ownership check)`, i === "1041" ? "error" : "info");
    if (i === "1041") onReveal();
  };

  const inv = INVOICES[id];

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Your invoice</h4>
        <span className="sim-muted">shoplift.app/account/invoice?id=…</span>
      </div>
      {err || !inv ? (
        <div className="sim-alert err">Invoice not found.</div>
      ) : (
        <div className="sim-invoice">
          <h4>Invoice #{id}</h4>
          <p className="sim-muted">Issued to: {inv.name}</p>
          <p className="sim-amount">{inv.amount}</p>
          <p className="sim-note">{inv.note}</p>
        </div>
      )}
      <div className="sim-form sim-inline-form">
        <label className="sim-muted">Open invoice</label>
        <input
          className="sim-field"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          spellCheck="false"
        />
        <button className="sim-button ghost" onClick={() => go(raw)}>
          Go
        </button>
      </div>
    </div>
  );
}

function SessionPage({ token, onReveal }) {
  const [status, setStatus] = useState(null);
  const { setCookie } = useBrowser();

  const save = (e) => {
    e.preventDefault();
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCookie("session", token);
      setStatus(
        payload.role === "admin"
          ? { ok: true, text: "Admin session accepted. FLAG{jwt_4lg_n0_s3cr3t}" }
          : { ok: true, text: `Token saved as ${payload.user} (${payload.role}).` }
      );
      if (payload.role === "admin") onReveal();
    } catch {
      setStatus({ ok: false, text: "Could not decode token." });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Session token</h4>
        <span className="sim-muted">signed in as {decodeSession(token).user} · {decodeSession(token).role}</span>
      </div>
      <form className="sim-form" onSubmit={save}>
        <p className="sim-muted">
          The token lives in a cookie called <code>session</code>. Edit it in the cookie jar, or paste a
          new token below.
        </p>
        <button
          type="button"
          className="sim-button ghost"
          onClick={() => {
            const forged = `${btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${btoa(
              JSON.stringify({ user: "admin", role: "admin", exp: 1999999999 })
            )}.Zm9yZ2Vk`;
            setCookie("session", forged);
            setStatus({ ok: true, text: "Forged token written to the cookie jar." });
          }}
        >
          🔧 Forge role: admin
        </button>
        <button type="submit" className="sim-button">Save current cookie</button>
      </form>
      {status ? (
        <div className={`sim-alert ${status.ok ? "ok" : "err"}`}>{status.text}</div>
      ) : null}
      <pre className="sim-code">{`Cookie jar: session = ${token ? token.slice(0, 32) + "…" : "(none)"}`}</pre>
    </div>
  );
}

function AccountPage({ onReveal }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [extra, setExtra] = useState("");
  const [status, setStatus] = useState(null);

  const login = (e) => {
    e.preventDefault();
    if (user.includes("$ne")) {
      setStatus({ ok: true, text: "Query matched FIRST user → logged in as admin. FLAG{n0sql_$ne_bypass}" });
      onReveal("nosql-injection", "FLAG{n0sql_$ne_bypass}");
    } else {
      setStatus({ ok: false, text: "Login failed." });
    }
  };

  const register = (e) => {
    e.preventDefault();
    if (extra.includes("role") && extra.includes("admin")) {
      setStatus({ ok: true, text: "Account created with role=admin. FLAG{m4ss_4ss1gn}" });
      onReveal("mass-assignment", "FLAG{m4ss_4ss1gn}");
    } else {
      setStatus({ ok: true, text: "Student… account created (role=user)." });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Account centre</h4>
        <span className="sim-muted">Mongo-backed, JSON in</span>
      </div>
      <form className="sim-form" onSubmit={login}>
        <h4>Sign in</h4>
        <label className="sim-muted">Username</label>
        <input
          className="sim-field"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder='username — try {"$ne":""}'
          spellCheck="false"
        />
        <label className="sim-muted">Password</label>
        <input
          className="sim-field"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="password"
        />
        <button type="submit" className="sim-button">Sign in</button>
      </form>
      <form className="sim-form" onSubmit={register}>
        <h4>Create account</h4>
        <label className="sim-muted">Extra fields sent with the request</label>
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
        <div className={`sim-alert ${status.ok ? "ok" : "err"}`}>{status.text}</div>
      ) : null}
    </div>
  );
}

function ApiPage({ onReveal }) {
  const [origin, setOrigin] = useState("https://shoplift.app");
  const [out, setOut] = useState(null);

  const fetchData = (e) => {
    e.preventDefault();
    const evil = !origin.startsWith("https://shoplift.app");
    setOut(
      evil
        ? { evil: true, text: `ACAO: ${origin} + credentials → response readable. FLAG{c0rs_r3fl3ct}` }
        : { evil: false, text: "Allowed (same-origin)." }
    );
    if (evil) onReveal();
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Partner API console</h4>
        <span className="sim-muted">/api/orders</span>
      </div>
      <form className="sim-form" onSubmit={fetchData}>
        <label className="sim-muted">Origin</label>
        <input
          className="sim-field"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          spellCheck="false"
        />
        <button type="submit" className="sim-button">Fetch</button>
      </form>
      {out ? (
        <div className={`sim-alert ${out.evil ? "err" : "ok"}`}>{out.text}</div>
      ) : null}
    </div>
  );
}

function OffersPage({ onReveal }) {
  const [next, setNext] = useState("https://shoplift.app/dashboard");
  const [out, setOut] = useState(null);
  const { request, log } = useBrowser();

  const go = (e) => {
    e.preventDefault();
    const evil = !next.startsWith("https://shoplift.app/");
    request("GET", `/offer?next=${encodeURIComponent(next)}`, evil ? 302 : 302);
    log(`open redirect: next=${next}`, evil ? "error" : "info");
    setOut(
      evil
        ? { evil: true, text: `Redirecting to ${next} — phishing-ready. FLAG{0p3n_r3d1r3ct}` }
        : { evil: false, text: "Redirecting internally." }
    );
    if (evil) onReveal();
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Partner offers</h4>
        <span className="sim-muted">the destination is user-controlled</span>
      </div>
      <form className="sim-form" onSubmit={go}>
        <label className="sim-muted">Continue to</label>
        <input
          className="sim-field"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          spellCheck="false"
        />
        <button type="submit" className="sim-button">Continue →</button>
      </form>
      {out ? (
        <div className={`sim-alert ${out.evil ? "err" : "ok"}`}>{out.text}</div>
      ) : null}
    </div>
  );
}

function ProfilePage({ onReveal }) {
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState(null);
  const { log } = useBrowser();

  const render = (e) => {
    e.preventDefault();
    log(`renderProfile(bio) via innerHTML`, /onerror/.test(bio) ? "error" : "info");
    if (/<script|onerror=/.test(bio)) {
      setStatus({ ok: true, evil: true, text: "alert(1) ran via innerHTML — DOM XSS. FLAG{d0m_xss_p0rtal}" });
      onReveal();
    } else {
      setStatus({ ok: true, evil: false, text: "Profile rendered safely." });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Profile preview</h4>
        <span className="sim-muted">written with innerHTML</span>
      </div>
      <form className="sim-form" onSubmit={render}>
        <label className="sim-muted">Bio</label>
        <textarea
          className="sim-field sim-area"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows="3"
          placeholder='<img src=x onerror=alert(1)>'
          spellCheck="false"
        />
        <button type="submit" className="sim-button">Preview</button>
      </form>
      {status ? (
        <div className={`sim-alert ${status.evil ? "err" : "ok"}`}>{status.text}</div>
      ) : null}
    </div>
  );
}

function BlindSqliPage({ onReveal }) {
  const [q, setQ] = useState("");
  const [out, setOut] = useState(null);
  const { request, log } = useBrowser();

  const submit = (e) => {
    e.preventDefault();
    request("POST", "/api/search/blind", 200);
    log(`blind probe: ${q || ""}`, /1=1/i.test(q) ? "error" : "info");
    const payload = q.trim().toLowerCase();
    if (payload.includes("1=1") || payload.includes("' or '1'='1'--")) {
      setOut("TRUE — 17,486 products match.");
      onReveal();
    } else if (payload.includes("1=2")) {
      setOut("FALSE — 0 products match.");
    } else {
      setOut(`… ${(q.length * 7919) % 900 + 100} products match.`);
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Search (blind)</h4>
        <span className="sim-muted">shoplift.app/search/blind — no results shown</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <div className="sim-search-row">
          <input
            className="sim-field"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Try: shirt'
            spellCheck="false"
          />
          <button type="submit" className="sim-button">Search</button>
        </div>
      </form>
      {out ? (
        <div className={`sim-alert ${out.startsWith("TRUE") ? "err" : "ok"}`}>{out}</div>
      ) : (
        <p className="sim-muted">The app never prints rows — you only get TRUE / FALSE. Judge by the count.</p>
      )}
      <pre className="sim-code">{`SELECT name FROM products WHERE name LIKE '%${q || "…"}' AND visible = 1`}</pre>
    </div>
  );
}

function ErrorSqliPage({ onReveal }) {
  const [q, setQ] = useState("");
  const [out, setOut] = useState(null);
  const [statusText, setStatusText] = useState(null);
  const { request, log } = useBrowser();

  const submit = (e) => {
    e.preventDefault();
    request("POST", "/api/search/union", 200);
    log(`union probe: ${q || ""}`, /union/i.test(q) ? "error" : "info");
    if (/union\s+select/i.test(q)) {
      setOut([
        { c1: "admin", c2: "FLAG{un10n_s3l3ct_0nly}" },
        { c1: "alice", c2: "d0nt_u5e_pa55w0rd" },
      ]);
      onReveal();
    } else {
      setOut(null);
      setStatusText("Unknown column 'visible' in 'where clause' — no result rows returned.");
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Search (UNION)</h4>
        <span className="sim-muted">shoplift.app/search/union — leaks data through UNION</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <div className="sim-search-row">
          <input
            className="sim-field"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="' UNION SELECT username, password FROM users--"
            spellCheck="false"
          />
          <button type="submit" className="sim-button">Search</button>
        </div>
      </form>
      {statusText ? <div className="sim-alert err">{statusText}</div> : null}
      {out ? (
        <table className="sim-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody>
            {out.map((r) => (
              <tr key={r.c1}>
                <td>{r.c1}</td>
                <td className="sim-flag">{r.c2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <pre className="sim-code">{`SELECT name, price FROM products
  WHERE name LIKE '%${q || "…"}'`}</pre>
    </div>
  );
}

function WafLoginPage({ onReveal }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [status, setStatus] = useState(null);
  const { request, log } = useBrowser();

  const WAF = /\bor\b|\band\b|--|\/\*|union|select|from|drop|insert/i;

  const submit = (e) => {
    e.preventDefault();
    request("POST", "/api/login/waf", 200);
    log(`WAF login: ${user || ""}`, "info");
    if (WAF.test(user) || WAF.test(pass)) {
      setStatus({ ok: false, text: "🚫 Blocked by Web Application Firewall (WAF)." });
      log("request blocked by WAF signature", "warn");
      return;
    }
    const joined = `${user}|${pass}`;
    if (/\|'1'='1/.test(joined) || /0x[0-9a-f]{4,}/i.test(joined)) {
      setStatus({ ok: true, text: "WAF whiffed — concatenation slipped through. Logged in as admin. FLAG{w4f_0nly_l00ks_f0r_f34r_w0rdz}" });
      log("WAF bypass succeeded via || concatenation", "error");
      onReveal();
    } else {
      setStatus({ ok: false, text: "Invalid credentials." });
    }
  };

  return (
    <div>
      <div className="sim-panel-head">
        <h4>Sign in (WAF protected)</h4>
        <span className="sim-muted">shoplift.app/login/waf — layer 7 filter</span>
      </div>
      <form className="sim-form" onSubmit={submit}>
        <label className="sim-muted">Username</label>
        <input
          className="sim-field"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="admin'||'1'='1"
          spellCheck="false"
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
      <pre className="sim-code">{`WAF rule: deny  or  and  --  /*  union  select  from  drop  insert`}</pre>
    </div>
  );
}

function AdminPage({ session, onReveal }) {
  const isAdmin = decodeSession(session).role === "admin";
  useEffect(() => {
    if (isAdmin) onReveal();
  }, [isAdmin, onReveal]);
  return (
    <div>
      <div className="sim-panel-head">
        <h4>Admin console</h4>
        <span className="sim-muted">shoplift.app/admin — role-gated</span>
      </div>
      {isAdmin ? (
        <div>
          <div className="sim-alert err">{"FLAG{3l3vat3d_2_admin}"}</div>
          <table className="sim-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Active sessions</td><td>12,400</td></tr>
              <tr><td>Refunds pending</td><td>3</td></tr>
              <tr><td>Inventory at risk</td><td>0</td></tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="sim-alert err">403 — This console is restricted to <code>role: admin</code>. Your cookie says {decodeSession(session).role}.</div>
      )}
    </div>
  );
}

const NAV = [
  ["home", "Home"],
  ["search", "Search"],
  ["blind", "Blind"],
  ["union", "Union"],
  ["login", "Sign in"],
  ["waf", "WAF Login"],
  ["guestbook", "Guestbook"],
  ["invoices", "Invoices"],
  ["session", "Session"],
  ["account", "Account"],
  ["admin", "Admin"],
  ["offers", "Offers"],
  ["api", "API"],
  ["profile", "Profile"],
  ["ping", "NetPing"],
  ["docs", "DocVault"],
  ["fetch", "ProxyFetch"],
  ["upload", "PicDrop"],
  ["greet", "Greeter"],
  ["import", "Import"],
];

const TOOLS = ["ping", "docs", "fetch", "upload", "greet", "import"];

const KNOWN_PAGES = ["home", "search", "blind", "union", "login", "waf", "guestbook", "invoices", "session", "account", "admin", "offers", "api", "profile", "tools"];

export default function ShopLift({ onReveal }) {
  return (
    <BrowserFrame domain="shoplift.app">
      <ShopInner onReveal={onReveal} />
    </BrowserFrame>
  );
}

function ShopInner({ onReveal }) {
  const [raw, setRaw] = useState("https://shoplift.app/");
  const [path, setPath] = useState("/home");
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
    const nextPath = u.pathname.startsWith("/") ? u.pathname : `/${u.pathname}`;
    setPath(nextPath);
    request("GET", nextPath, KNOWN_PAGES.includes(nextPath.split("/")[1]) ? 200 : 404);
  };

  const page = path.split("/")[1] || "home";
  const realPage = TOOLS.includes(page) ? "tools" : page;

  return (
    <Shell>
      <BrowserChrome url={raw} onNavigate={navigate} editable />
      <div className="sim-site shop shop-site">
        <header className="sim-site-head">
          <span className="sim-logo">🛍 ShopLift</span>
          <span className="sim-user">{decodeSession(session).user} · {decodeSession(session).role}</span>
        </header>
        <nav className="sim-toolbar">
          {NAV.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={page === id ? "on" : ""}
              onClick={(e) => {
                e.preventDefault();
                navigate(`https://shoplift.app/${id}`);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="sim-body">
          <div className="sim-main">
            {realPage === "home" ? (
              <HomePage onNavigate={(p) => navigate(`https://shoplift.app/${p}`)} />
            ) : null}
            {realPage === "search" ? (
              <SearchPage onReveal={() => reveal("shoplift-search", "FLAG{7h3y_trust3d_th3_1nput}")} />
            ) : null}
            {realPage === "blind" ? (
              <BlindSqliPage onReveal={() => reveal("sqli-blind", "FLAG{bl1nd_tru3_f4ls3}")} />
            ) : null}
            {realPage === "union" ? (
              <ErrorSqliPage onReveal={() => reveal("sqli-union", "FLAG{un10n_s3l3ct_0nly}")} />
            ) : null}
            {realPage === "login" ? (
              <LoginPage onReveal={() => reveal("shoplift-login", "' OR '1'='1")} />
            ) : null}
            {realPage === "waf" ? (
              <WafLoginPage onReveal={() => reveal("sqli-waf", "FLAG{w4f_0nly_l00ks_f0r_f34r_w0rdz}")} />
            ) : null}
            {realPage === "guestbook" ? (
              <GuestbookPage onReveal={() => reveal("xss-guestbook", "FLAG{5cr1pt_k1dd13_f0und_u}")} />
            ) : null}
            {realPage === "invoices" ? (
              <InvoicesPage onReveal={() => reveal("novabank", "FLAG{n0_0wn3rsh1p_ch3ck}")} />
            ) : null}
            {realPage === "session" ? (
              <SessionPage token={session} onReveal={() => reveal("jwt-forgery", "FLAG{jwt_4lg_n0_s3cr3t}")} />
            ) : null}
            {realPage === "account" ? (
              <AccountPage onReveal={reveal} />
            ) : null}
            {realPage === "admin" ? (
              <AdminPage session={session} onReveal={() => reveal("priv-esc", "FLAG{3l3vat3d_2_admin}")} />
            ) : null}
            {realPage === "offers" ? (
              <OffersPage onReveal={() => reveal("open-redirect", "FLAG{0p3n_r3d1r3ct}")} />
            ) : null}
            {realPage === "api" ? (
              <ApiPage onReveal={() => reveal("cors", "FLAG{c0rs_r3fl3ct}")} />
            ) : null}
            {realPage === "profile" ? (
              <ProfilePage onReveal={() => reveal("dom-xss", "FLAG{d0m_xss_p0rtal}")} />
            ) : null}
            {realPage === "tools" ? (
              <ToolsPage page={page} onReveal={reveal} />
            ) : null}
            {!KNOWN_PAGES.includes(realPage) ? (
              <div className="sim-alert err">404 — {path} not found.</div>
            ) : null}
          </div>
        </div>
        <footer className="sim-footer">
          © 2025 ShopLift — Simulated marketplace; nothing leaves your browser.
        </footer>
      </div>
    </Shell>
  );
}
