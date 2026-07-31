import { useEffect, useState } from "react";

import { BrowserCtx } from "./browserCtx";

let seq = 0;
const nextId = () => `${Date.now()}-${(seq += 1)}`;

function loadCookies(domain) {
  try {
    const raw = localStorage.getItem(`cwc-cookies-${domain}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const PANELS = [
  ["cookies", "🍪 Cookies"],
  ["network", "📡 Network"],
  ["console", "🖥 Console"],
];

function DevTools({ value }) {
  const [tab, setTab] = useState("cookies");
  const [name, setName] = useState("");
  const [val, setVal] = useState("");
  const [decodeIn, setDecodeIn] = useState("");
  const [decodeOut, setDecodeOut] = useState("");

  const { cookies, setCookie, deleteCookie, clearCookies, requests, consoleLines } =
    value;

  return (
    <aside className="devtools">
      <div className="devtools-tabs">
        {PANELS.map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "on" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="devtools-body">
        {tab === "cookies" ? (
          <div className="cookies-panel">
            <p className="devtools-hint">
              The app reads these cookies live — edit a session cookie and the
              next request uses your value.
            </p>
            {Object.keys(cookies).length === 0 ? (
              <p className="devtools-empty">
                No cookies for this site yet. Sign in or visit the session page
                to create one.
              </p>
            ) : null}
            {Object.entries(cookies).map(([n, v]) => (
              <div className="cookie-row" key={n}>
                <div className="cookie-name">{n}</div>
                <textarea
                  className="cookie-value sim-mono"
                  rows={Math.max(2, Math.ceil(String(v).length / 30))}
                  value={v}
                  onChange={(e) => setCookie(n, e.target.value)}
                  spellCheck="false"
                />
                <div className="cookie-actions">
                  <button
                    className="devtools-btn"
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(v);
                      } catch {
                        /* ignore */
                      }
                    }}
                  >
                    Copy
                  </button>
                  <button
                    className="devtools-btn danger"
                    onClick={() => deleteCookie(n)}
                    title="Delete cookie"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
            <div className="cookie-add">
              <input
                className="devtools-input"
                placeholder="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                spellCheck="false"
              />
              <input
                className="devtools-input"
                placeholder="value"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                spellCheck="false"
              />
              <button
                className="devtools-btn"
                onClick={() => {
                  if (name) {
                    setCookie(name, val);
                    setName("");
                    setVal("");
                  }
                }}
              >
                + Add
              </button>
            </div>
            <button className="devtools-btn ghost" onClick={clearCookies}>
              Clear all cookies
            </button>

            <div className="decode-box">
              <p className="devtools-hint">
                Base64 decode / encode — JWTs and cookies are just base64 JSON.
              </p>
              <textarea
                className="sim-mono"
                rows="3"
                value={decodeIn}
                onChange={(e) => setDecodeIn(e.target.value)}
                placeholder="paste a token…"
                spellCheck="false"
              />
              <div className="decode-actions">
                <button
                  className="devtools-btn"
                  onClick={() => {
                    try {
                      setDecodeOut(atob(decodeIn.trim()));
                    } catch {
                      setDecodeOut("Invalid base64.");
                    }
                  }}
                >
                  Decode
                </button>
                <button
                  className="devtools-btn"
                  onClick={() => {
                    try {
                      setDecodeOut(btoa(decodeIn));
                    } catch {
                      setDecodeOut("Cannot encode that.");
                    }
                  }}
                >
                  Encode
                </button>
              </div>
              <pre className="decode-out">{decodeOut}</pre>
            </div>
          </div>
        ) : null}

        {tab === "network" ? (
          <div className="net-list">
            <p className="devtools-hint">
              Simulated requests the app made — watch how your inputs and
              cookies show up.
            </p>
            {requests.length === 0 ? (
              <p className="devtools-empty">
                No requests yet — click around the app.
              </p>
            ) : null}
            {requests.map((r) => (
              <div className="net-row" key={r.id}>
                <span className={`method ${r.method.toLowerCase()}`}>
                  {r.method}
                </span>
                <span className="net-status" data-status={String(r.status)[0]}>
                  {r.status}
                </span>
                <span className="net-url">{r.url}</span>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "console" ? (
          <div className="console-list">
            <p className="devtools-hint">Console output from the app.</p>
            {consoleLines.length === 0 ? (
              <p className="devtools-empty">No console output yet.</p>
            ) : null}
            {consoleLines.map((c) => (
              <div className={`console-line ${c.level}`} key={c.id}>
                <span className="console-lvl">{c.level}</span>
                <span>{c.msg}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

export default function BrowserFrame({ domain = "app", children }) {
  const [cookies, setCookies] = useState(() => loadCookies(domain));
  const [requests, setRequests] = useState([]);
  const [consoleLines, setConsoleLines] = useState([]);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(`cwc-cookies-${domain}`, JSON.stringify(cookies));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [cookies, domain]);

  const setCookie = (n, v) =>
    setCookies((c) => ({ ...c, [n]: typeof v === "string" ? v : JSON.stringify(v) }));
  const deleteCookie = (n) =>
    setCookies((c) => {
      const rest = { ...c };
      delete rest[n];
      return rest;
    });
  const clearCookies = () => setCookies({});
  const request = (method, url, status) =>
    setRequests((r) => [{ id: nextId(), method, url, status, t: Date.now() }, ...r].slice(0, 60));
  const log = (msg, level = "info") =>
    setConsoleLines((l) => [{ id: nextId(), msg, level, t: Date.now() }, ...l].slice(0, 60));

  const value = {
    cookies,
    setCookie,
    deleteCookie,
    clearCookies,
    request,
    log,
    requests,
    consoleLines,
    domain,
  };

  return (
    <BrowserCtx.Provider value={value}>
      <div className="browser-frame">
        <div className="browser-frame-top">
          <button
            className={`devtools-toggle ${panelOpen ? "on" : ""}`}
            onClick={() => setPanelOpen((o) => !o)}
          >
            {panelOpen ? "◀" : "▶"} 🧰 DevTools
          </button>
          <span className="muted devtools-label">
            session & request tools — cookies · network · console
          </span>
        </div>
        <div className={`browser-layout ${panelOpen ? "with-panel" : ""}`}>
          <div className="browser-main">{children}</div>
          {panelOpen ? <DevTools value={value} /> : null}
        </div>
      </div>
    </BrowserCtx.Provider>
  );
}
