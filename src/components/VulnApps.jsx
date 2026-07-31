import { useState } from "react";

import { BrowserChrome, Shell } from "./SimBrowser";

/* ── 1. Stored XSS guestbook ─────────────────────────────────── */
export function XssGuestbook({ onReveal }) {
  const [text, setText] = useState("");
  const [comments, setComments] = useState([
    { id: 1, user: "mod", body: "Welcome to the Vibe guestbook! Be nice." },
  ]);
  const [status, setStatus] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (/<script/i.test(text)) {
      setComments((c) => [
        ...c,
        { id: Date.now(), user: "anonymous", body: text },
      ]);
      setStatus({
        ok: true,
        injected: true,
        text: "alert('pwned') executed in your browser → cookie sent to attacker.",
      });
      onReveal("FLAG{5cr1pt_k1dd13_f0und_u}");
    } else {
      setComments((c) => [
        ...c,
        { id: Date.now(), user: "anonymous", body: text },
      ]);
      setStatus({ ok: true, injected: false, text: "Thanks for posting!" });
    }
    setText("");
  };

  return (
    <Shell>
      <BrowserChrome url="https://vibe-chat.app/guestbook.php" />
      <div className="sim-site vibe">
        <header className="sim-site-head">
          <span className="sim-logo">💬 VibeChat</span>
          <nav className="sim-nav">
            <a href="#guestbook" onClick={(e) => e.preventDefault()}>
              Guestbook
            </a>
            <a href="#top" onClick={(e) => e.preventDefault()}>
              Top Comments
            </a>
          </nav>
        </header>

        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={submit}>
              <h4>Leave a comment</h4>
              <textarea
                className="sim-field sim-area"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Say something nice…"
                rows="3"
              />
              <button type="submit" className="sim-button">
                Post comment
              </button>
            </form>

            {status ? (
              <div
                className={`sim-alert ${status.injected ? "err" : "ok"}`}
              >
                {status.text}
              </div>
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

          <aside className="sim-side">
            <p className="sim-side-title">Comment rules</p>
            <p className="sim-muted sim-hint">
              We render every comment with raw HTML. Surely nobody would abuse
              that…
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ── 2. Command injection ping tool ──────────────────────────── */
export function CmdPing({ onReveal }) {
  const [target, setTarget] = useState("8.8.8.8");
  const [output, setOutput] = useState(null);
  const [injected, setInjected] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const evil = /[;&|`$]/.test(target);
    setInjected(evil);
    if (evil) {
      setOutput(
        [
          "PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.",
          "64 bytes from 8.8.8.8: icmp_seq=1 ttl=115 time=12.3 ms",
          "64 bytes from 8.8.8.8: icmp_seq=2 ttl=115 time=11.8 ms",
          "uid=0(root) gid=0(root) groups=0(root)",
          "SECRET KEY FOUND: FLAG{p1ng_3x3c_4rby}",
        ]
      );
      onReveal("FLAG{p1ng_3x3c_4rby}");
    } else {
      setOutput([
        "PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.",
        "64 bytes from 8.8.8.8: icmp_seq=1 ttl=115 time=12.3 ms",
        "64 bytes from 8.8.8.8: icmp_seq=2 ttl=115 time=11.8 ms",
        "64 bytes from 8.8.8.8: icmp_seq=3 ttl=115 time=12.0 ms",
        "--- 8.8.8.8 ping statistics ---",
        "3 packets transmitted, 3 received, 0% packet loss",
      ]);
    }
  };

  return (
    <Shell>
      <BrowserChrome url="https://netping.app/tools/ping" />
      <div className="sim-site ping">
        <header className="sim-site-head">
          <span className="sim-logo">📡 NetPing</span>
          <nav className="sim-nav">
            <a href="#ping" onClick={(e) => e.preventDefault()}>
              Ping
            </a>
            <a href="#dns" onClick={(e) => e.preventDefault()}>
              DNS Lookup
            </a>
          </nav>
        </header>

        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={submit}>
              <h4>Network diagnostics</h4>
              <div className="sim-search-row">
                <input
                  className="sim-field"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. 8.8.8.8 or example.com"
                  spellCheck="false"
                />
                <button type="submit" className="sim-button">
                  Ping
                </button>
              </div>
            </form>

            <pre className="sim-code">{`ping -c 4 ${target}`}</pre>

            {output ? (
              <div className={`ping-out ${injected ? "evil" : ""}`}>
                {output.map((line, i) => (
                  <pre key={i}>{line}</pre>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="sim-side">
            <p className="sim-side-title">How it works</p>
            <p className="sim-muted sim-hint">
              Your input is pasted straight into the shell command. A semicolon
              lets you chain another command.
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ── 3. Path traversal file viewer ───────────────────────────── */
export function TraversalViewer({ onReveal }) {
  const files = {
    "notes.txt": { title: "notes.txt", body: "Welcome to DocVault. The meeting notes are in the downloads folder." },
    "welcome.txt": { title: "welcome.txt", body: "Thanks for joining DocVault — your secure document portal." },
  };

  const [raw, setRaw] = useState(
    "https://docvault.app/view.php?file=notes.txt"
  );
  const [current, setCurrent] = useState("notes.txt");
  const [leaked, setLeaked] = useState(false);

  const go = (draft) => {
    let u;
    try {
      u = new URL(draft);
    } catch {
      return;
    }
    const file = u.searchParams.get("file") || "";
    setRaw(draft);
    setCurrent(file);
    if (/\.\.\//.test(file)) {
      setLeaked(true);
      onReveal("FLAG{d0t_d0t_5la5h}");
    } else {
      setLeaked(false);
    }
  };

  const isLeaked = leaked || /\.\.\//.test(current);

  return (
    <Shell>
      <BrowserChrome url={raw} onNavigate={go} editable />
      <div className="sim-site vault">
        <header className="sim-site-head">
          <span className="sim-logo">🗂 DocVault</span>
          <nav className="sim-nav">
            <a href="#docs" onClick={(e) => e.preventDefault()}>
              My Documents
            </a>
          </nav>
          <span className="sim-user">files: notes.txt, welcome.txt</span>
        </header>

        <div className="sim-body">
          <div className="sim-main">
            {isLeaked ? (
              <div className="sim-invoice">
                <h4>/etc/passwd</h4>
                <pre className="lesson-code leak">
                  {`root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
admin:x:1000:1000:WebAdmin:/home/admin:/bin/bash
└─ /home/admin/.credentials
   > admin password stored in plaintext: FLAG{d0t_d0t_5la5h}`}
                </pre>
                <p className="sim-muted">
                  You walked out of the sandbox directory with the server's own
                  files.
                </p>
              </div>
            ) : files[current] ? (
              <div className="sim-invoice">
                <h4>{files[current].title}</h4>
                <p className="sim-note">{files[current].body}</p>
                <p className="sim-muted">
                  Served from <b className="sim-acct">/var/www/docs/{current}</b>
                </p>
              </div>
            ) : (
              <div className="sim-alert err">File not found.</div>
            )}
          </div>

          <aside className="sim-side">
            <p className="sim-side-title">Available files</p>
            {Object.keys(files).map((f) => (
              <div key={f} className="sim-acct-row on">
                <span>📄 {f}</span>
              </div>
            ))}
            <p className="sim-muted sim-hint">
              Files load from a folder on the server. Try pointing the file
              parameter somewhere else…
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ── 4. SSRF URL fetcher ─────────────────────────────────────── */
export function SsrfFetch({ onReveal }) {
  const [url, setUrl] = useState("https://example.com/page");
  const [result, setResult] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const evil =
      /file:\/\//i.test(url) ||
      /169\.254\.169\.254/.test(url) ||
      /localhost/i.test(url) ||
      /127\.0\.0\.1/.test(url);
    if (evil) {
      setResult({
        ok: true,
        text: `GET ${url} → 200 OK (simulated)`,
        body:
          "HTTP/1.1 200 OK\nServer: cloud-meta\n{\n  \"instance-id\": \"i-0x3f\",\n  \"iam-secret\": \"FLAG{1n73rn4l_f3tch}\"\n}",
      });
      onReveal("FLAG{1n73rn4l_f3tch}");
    } else {
      setResult({
        ok: true,
        text: `GET ${url} → 200 OK · 4,201 bytes`,
        body: "<html><body><h1>Example Domain</h1></body></html>",
      });
    }
  };

  return (
    <Shell>
      <BrowserChrome url="https://proxyfetch.app/fetch" />
      <div className="sim-site pf">
        <header className="sim-site-head">
          <span className="sim-logo">🔎 ProxyFetch</span>
          <nav className="sim-nav">
            <a href="#fetch" onClick={(e) => e.preventDefault()}>
              Fetch URL
            </a>
          </nav>
        </header>

        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={submit}>
              <h4>URL checker</h4>
              <p className="sim-muted">
                Paste a URL and our server will fetch it and show you the
                first bytes.
              </p>
              <div className="sim-search-row">
                <input
                  className="sim-field"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  spellCheck="false"
                />
                <button type="submit" className="sim-button">
                  Fetch
                </button>
              </div>
            </form>

            {result ? (
              <div className="sim-invoice">
                <p className="sim-note">{result.text}</p>
                <pre className="lesson-code leak">{result.body}</pre>
              </div>
            ) : null}
          </div>

          <aside className="sim-side">
            <p className="sim-side-title">About</p>
            <p className="sim-muted sim-hint">
              The fetch runs with the server's credentials — localhost and
              cloud metadata are usually a single request away.
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ── 5. Unrestricted file upload ─────────────────────────────── */
export function UploadHub({ onReveal }) {
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);

  const onChange = (e) => {
    setFileName(e.target.files?.[0]?.name || "");
  };

  const submit = (e) => {
    e.preventDefault();
    if (!fileName) return;
    if (/\.php$/i.test(fileName) || /\.phtml$/i.test(fileName)) {
      setResult({
        ok: true,
        executed: true,
        text: `${fileName} uploaded → executed as PHP on the server`,
        body: "<html><body><b>pwned by Cyber Wolf</b> · FLAG{up10ad_4nd_3x3c}</body></html>",
      });
      onReveal("FLAG{up10ad_4nd_3x3c}");
    } else {
      setResult({
        ok: true,
        executed: false,
        text: `${fileName} uploaded successfully. It sits in /uploads.`,
        body: null,
      });
    }
  };

  return (
    <Shell>
      <BrowserChrome url="https://picdrop.app/upload" />
      <div className="sim-site up">
        <header className="sim-site-head">
          <span className="sim-logo">📸 PicDrop</span>
          <nav className="sim-nav">
            <a href="#upload" onClick={(e) => e.preventDefault()}>
              Upload
            </a>
          </nav>
        </header>

        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={submit}>
              <h4>Upload your avatar</h4>
              <p className="sim-muted">
                Any image works. We only check the extension on the front end —
                obviously.
              </p>
              <input
                type="file"
                className="sim-file"
                onChange={onChange}
              />
              <button type="submit" className="sim-button">
                Upload
              </button>
              {fileName ? (
                <p className="sim-muted">Selected: {fileName}</p>
              ) : null}
            </form>

            {result ? (
              <div className="sim-invoice">
                <p
                  className={`sim-alert ${result.executed ? "err" : "ok"}`}
                >
                  {result.text}
                </p>
                {result.body ? (
                  <pre className="lesson-code leak">{result.body}</pre>
                ) : null}
              </div>
            ) : null}
          </div>

          <aside className="sim-side">
            <p className="sim-side-title">Uploads dir</p>
            <p className="sim-muted sim-hint">
              Files land in /uploads with their original extension and the
              server executes anything it thinks is a script.
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ═══ Playground 1 · Springfield High School Portal ═══ */

export function SchoolLogin({ onReveal }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [board, setBoard] = useState(false);
  const [status, setStatus] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (user === "staff_john" && pass === "Summer2024!") {
      setStatus({ ok: true, staff: true, text: "Welcome, staff_john (Staff). You're in." });
      onReveal("FLAG{st4ff_1nt3rn4l_4cc}");
    } else if (user === "alice" && pass === "student123") {
      setStatus({ ok: true, staff: false, text: "Welcome, alice (Student)." });
    } else {
      setStatus({ ok: false, text: "Invalid username or password." });
    }
  };

  return (
    <Shell>
      <BrowserChrome url="https://springfield.edu/portal/login" />
      <div className="sim-site school">
        <header className="sim-site-head">
          <span className="sim-logo">🏫 Springfield High</span>
          <nav className="sim-nav">
            <a href="#portal" onClick={(e) => e.preventDefault()}>Portal</a>
            <a href="#board" onClick={(e) => e.preventDefault()}>Message Board</a>
          </nav>
        </header>
        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={submit}>
              <h4>Student / Staff login</h4>
              <label>Username
                <input className="sim-field" value={user} onChange={(e) => setUser(e.target.value)} placeholder="username" autoComplete="off" />
              </label>
              <label>Password
                <input className="sim-field" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="password" autoComplete="off" />
              </label>
              <button type="submit" className="sim-button">Sign in</button>
              {status ? <div className={`sim-alert ${status.ok ? "ok" : "err"}`}>{status.text}</div> : null}
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
          <aside className="sim-side">
            <p className="sim-side-title">Did you know?</p>
            <p className="sim-muted sim-hint">
              The district uses a third-party attendance plugin. IT posts
              password resets where everyone can see them.
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

export function SchoolDbConsole({ onReveal }) {
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
        "|    | FLAG{db_n0_authz}                       |",
        "+----+--------------+--------+------------+",
      ]);
      onReveal("FLAG{db_n0_authz}");
    } else {
      setOut([`Query executed: 0 rows returned.`]);
    }
  };

  return (
    <Shell>
      <BrowserChrome url="https://springfield.edu/staff/db-console" />
      <div className="sim-site school">
        <header className="sim-site-head">
          <span className="sim-logo">🏫 Springfield High · Staff Tools</span>
          <span className="sim-user">staff_john</span>
        </header>
        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={submit}>
              <h4>Database console (beta)</h4>
              <p className="sim-muted">
                The attendance plugin exposed its database console to staff. It
                runs any SQL you type.
              </p>
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
                {out.map((line, i) => <pre key={i}>{line}</pre>)}
              </div>
            ) : null}
          </div>
          <aside className="sim-side">
            <p className="sim-side-title">Note</p>
            <p className="sim-muted sim-hint">
              No authorization check — any staff member can query the whole
              student database.
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

export function SchoolFees({ onReveal }) {
  const students = ["You (Grade 9)", "Priya Nair (Grade 12)", "Marcus Reed (Grade 11)"];
  const [student, setStudent] = useState(students[0]);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (!amount) return;
    setStatus({
      ok: true,
      tampered: student !== students[0],
      text: `Fee record updated for ${student}: $${amount} → saved to school.db`,
    });
    if (student !== students[0]) onReveal("FLAG{f33_74mp3r1ng}");
  };

  return (
    <Shell>
      <BrowserChrome url="https://springfield.edu/staff/fees" />
      <div className="sim-site school">
        <header className="sim-site-head">
          <span className="sim-logo">🏫 Springfield High · Fees</span>
          <span className="sim-user">staff_john</span>
        </header>
        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={submit}>
              <h4>Update fee records</h4>
              <label>Student
                <select className="sim-field" value={student} onChange={(e) => setStudent(e.target.value)}>
                  {students.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label>Amount ($)
                <input className="sim-field" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </label>
              <button type="submit" className="sim-button">Save fee</button>
              {status ? (
                <div className={`sim-alert ${status.ok ? "ok" : "err"}`}>{status.text}</div>
              ) : null}
            </form>
          </div>
          <aside className="sim-side">
            <p className="sim-side-title">Rule</p>
            <p className="sim-muted sim-hint">
              The fees API checks that you're logged in — but never checks
              whether you're allowed to edit that record.
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ═══ Playground 2 · CyberBank ═══ */

export function BankCookie({ onReveal }) {
  const SESSION = btoa(JSON.stringify({ user: "alice", role: "user" }));
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [logged, setLogged] = useState(false);
  const [tamper, setTamper] = useState("");
  const [status, setStatus] = useState(null);
  const [admin, setAdmin] = useState(false);

  const login = (e) => {
    e.preventDefault();
    if (user === "alice" && pass === "pass") {
      setLogged(true);
      setStatus({ ok: true, text: "Logged in as alice. Your session is stored in a cookie." });
    } else {
      setStatus({ ok: false, text: "Invalid credentials." });
    }
  };

  const loadCookie = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(atob(tamper.trim()));
      if (parsed.role === "admin") {
        setAdmin(true);
        setStatus({ ok: true, text: "Cookie accepted → logged in as ADMIN. Welcome, alice (admin)." });
        onReveal("FLAG{c00k13_f0rg3ry}");
      } else {
        setStatus({ ok: false, text: "Cookie loaded, but you're still a regular user." });
      }
    } catch {
      setStatus({ ok: false, text: "Invalid cookie — must be base64 of JSON." });
    }
  };

  return (
    <Shell>
      <BrowserChrome url="https://cyberbank.app/login" />
      <div className="sim-site bank">
        <header className="sim-site-head">
          <span className="sim-logo">🏦 CyberBank</span>
          <nav className="sim-nav">
            <a href="#login" onClick={(e) => e.preventDefault()}>Login</a>
            <a href="#safe" onClick={(e) => e.preventDefault()}>Safe Deposit</a>
          </nav>
        </header>
        <div className="sim-body">
          <div className="sim-main">
            {!logged ? (
              <form className="sim-form" onSubmit={login}>
                <h4>Sign in (demo)</h4>
                <label>Username <input className="sim-field" value={user} onChange={(e) => setUser(e.target.value)} placeholder="alice" /></label>
                <label>Password <input className="sim-field" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="pass" /></label>
                <button type="submit" className="sim-button">Sign in</button>
                {status ? <div className={`sim-alert ${status.ok ? "ok" : "err"}`}>{status.text}</div> : null}
              </form>
            ) : (
              <div className="sim-invoice">
                <h4>Session inspector</h4>
                <p className="sim-muted">Your session cookie:</p>
                <pre className="lesson-code">{SESSION}</pre>
                <p className="sim-muted">Decoded: <code>{JSON.stringify({ user: "alice", role: "user" })}</code></p>

                <form className="sim-form" onSubmit={loadCookie}>
                  <label>Paste a new cookie value
                    <input className="sim-field" value={tamper} onChange={(e) => setTamper(e.target.value)} placeholder={SESSION} spellCheck="false" />
                  </label>
                  <button type="submit" className="sim-button">Load cookie</button>
                </form>
                {status ? <div className={`sim-alert ${status.ok ? "ok" : "err"}`}>{status.text}</div> : null}
                {admin ? (
                  <div className="playground-captured" style={{ marginTop: 12 }}>
                    <span>🔐 ADMIN VAULT</span>
                    <code>transfer limit lifted · all accounts visible</code>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <aside className="sim-side">
            <p className="sim-side-title">Cookie jar</p>
            <p className="sim-muted sim-hint">
              The server just base64-decodes the cookie and trusts the role
              inside. No signature, no HttpOnly.
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

export function BankCsrf({ onReveal }) {
  const [email, setEmail] = useState(false);
  const [fired, setFired] = useState(false);

  const fire = () => {
    setFired(true);
    onReveal("FLAG{csrf_n0_t0k3n}");
  };

  return (
    <Shell>
      <BrowserChrome url="https://cyberbank.app/account" />
      <div className="sim-site bank">
        <header className="sim-site-head">
          <span className="sim-logo">🏦 CyberBank</span>
          <span className="sim-user">alice</span>
        </header>
        <div className="sim-body">
          <div className="sim-main">
            <div className="sim-invoice">
              <h4>Inbox</h4>
              <p className="sim-muted">1 unread message</p>
              <button className="learn-toggle" onClick={() => setEmail((e) => !e)}>
                <span>{email ? "▾" : "▸"}</span>
                From: "l33t h4x0r" — "LOL check this out"
              </button>
              {email ? (
                <div className="sim-log warn">
                  <pre>{`Hey! Cool site:\n<img src="https://cyberbank.app/transfer.php?to=EVIL-1337&amount=5000">`}</pre>
                </div>
              ) : null}
              {email && !fired ? (
                <button className="sim-button" style={{ marginTop: 12 }} onClick={fire}>
                  Render email images
                </button>
              ) : null}
              {fired ? (
                <div className="sim-alert err">
                  Transfer of $5,000.00 to account EVIL-1337 completed. No
                  confirmation asked — your browser sent it automatically.
                </div>
              ) : null}
            </div>
          </div>
          <aside className="sim-side">
            <p className="sim-side-title">Why?</p>
            <p className="sim-muted sim-hint">
              transfer.php has no CSRF token. Because you're logged in, the
              image request carries your session.
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

export function BankIdor({ onReveal }) {
  const accounts = {
    1001: { name: "Alice Chen", bal: "$1,204.00", type: "checking" },
    1002: { name: "Marcus Reed", bal: "$48,290.00", type: "checking", flag: true },
    1003: { name: "Priya Nair", bal: "$3,117.50", type: "savings" },
  };
  const [acct, setAcct] = useState("1001");
  const [raw, setRaw] = useState("https://cyberbank.app/statement?account=1001");
  const [err, setErr] = useState(false);

  const go = (draft) => {
    let u;
    try { u = new URL(draft); } catch { return; }
    const id = u.searchParams.get("account");
    setRaw(draft);
    setAcct(id);
    setErr(!accounts[id]);
    if (id === "1002") onReveal("FLAG{acc0unt_3num}");
  };

  const row = accounts[acct];

  return (
    <Shell>
      <BrowserChrome url={raw} onNavigate={go} editable />
      <div className="sim-site bank">
        <header className="sim-site-head">
          <span className="sim-logo">🏦 CyberBank</span>
          <span className="sim-user">alice</span>
        </header>
        <div className="sim-body">
          <div className="sim-main">
            {err || !row ? (
              <div className="sim-alert err">Statement not found.</div>
            ) : (
              <div className="sim-invoice">
                <h4>Account #{acct} · {row.name}</h4>
                <p className="sim-amount">{row.bal}</p>
                <p className="sim-muted">type: {row.type}</p>
                {row.flag ? <p className="sim-note">Internal memo: FLAG{'{acc0unt_3num}'}</p> : null}
              </div>
            )}
          </div>
          <aside className="sim-side">
            <p className="sim-side-title">Accounts</p>
            {Object.keys(accounts).map((id) => (
              <div key={id} className={`sim-acct-row ${acct === id ? "on" : ""}`}>
                <span>#{id}</span>
                <span>{accounts[id].name}</span>
              </div>
            ))}
            <p className="sim-muted sim-hint">Sequential account numbers…</p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ═══ Playground 3 · CareNow Clinic ═══ */

export function HealthRecords({ onReveal }) {
  const records = {
    2001: { name: "You", diag: "Seasonal flu", meds: "Paracetamol 500mg", note: "Follow-up in 2 weeks." },
    2002: { name: "Priya Nair", diag: "Chest x-ray pending", meds: "—", note: "Psych eval requested by HR. FLAG{p4t13nt_0v3rl00k}" },
    2003: { name: "Marcus Reed", diag: "Allergic rhinitis", meds: "Cetirizine 10mg", note: "Review in 3 months." },
  };
  const [raw, setRaw] = useState("https://carenow.app/records?id=2001");
  const [id, setId] = useState("2001");
  const [err, setErr] = useState(false);

  const go = (draft) => {
    let u;
    try { u = new URL(draft); } catch { return; }
    const rid = u.searchParams.get("id");
    setRaw(draft);
    setId(rid);
    setErr(!records[rid]);
    if (rid === "2002") onReveal("FLAG{p4t13nt_0v3rl00k}");
  };

  const rec = records[id];

  return (
    <Shell>
      <BrowserChrome url={raw} onNavigate={go} editable />
      <div className="sim-site health">
        <header className="sim-site-head">
          <span className="sim-logo">🏥 CareNow Clinic</span>
          <span className="sim-user">patient_portal</span>
        </header>
        <div className="sim-body">
          <div className="sim-main">
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
          </div>
          <aside className="sim-side">
            <p className="sim-side-title">Recent records</p>
            <div className="sim-acct-row on"><span>#2001</span><span>You</span></div>
            <p className="sim-muted sim-hint">
              Record ids are sequential. This portal never checks who you are.
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

export function HealthXss({ onReveal }) {
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
      onReveal("FLAG{xss1n_cl1n1c}");
    } else {
      setStatus({ ok: true, evil: false, text: "Appointment booked with Dr. Sharma." });
    }
    setNote("");
  };

  return (
    <Shell>
      <BrowserChrome url="https://carenow.app/appointments" />
      <div className="sim-site health">
        <header className="sim-site-head">
          <span className="sim-logo">🏥 CareNow Clinic</span>
          <span className="sim-user">patient_portal</span>
        </header>
        <div className="sim-body">
          <div className="sim-main">
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
              {status ? <div className={`sim-alert ${status.evil ? "err" : "ok"}`}>{status.text}</div> : null}
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
            <aside className="sim-side">
            <p className="sim-side-title">Notes</p>
            <p className="sim-muted sim-hint">
              Appointment notes are rendered with raw HTML for staff.
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ── 14. JWT forgery ─────────────────────────────────────────── */
export function JwtForgery({ onReveal }) {
  const h = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const original = `${h}.${btoa(JSON.stringify({ user: "alice", role: "user", exp: 1999999999 }))}.c2lnbmF0dXJlX3ZhbHVl`;
  const [token, setToken] = useState(original);
  const [status, setStatus] = useState(null);

  const load = (e) => {
    e.preventDefault();
    try {
      const [, p] = token.split(".");
      const payload = JSON.parse(atob(p));
      if (payload.role === "admin") {
        setStatus({ ok: true, evil: true, text: "Welcome, admin! Access granted. FLAG{jwt_4lg_n0_s3cr3t}" });
        onReveal("FLAG{jwt_4lg_n0_s3cr3t}");
      } else {
        setStatus({ ok: true, evil: false, text: `Signed in as ${payload.user} (${payload.role}). The server trusts the token — but you're not admin yet.` });
      }
    } catch {
      setStatus({ ok: true, evil: false, text: "Invalid token — the server rejected it." });
    }
  };

  const flipRole = () => {
    const token2 = `${h}.${btoa(JSON.stringify({ user: "alice", role: "admin", exp: 1999999999 }))}.Zm9yZ2VkX3NpZ25hdHVyZQ`;
    setToken(token2);
    setStatus({ ok: true, evil: false, text: "Token edited. Now press 'Verify token'." });
  };

  return (
    <Shell>
      <BrowserChrome url="https://cyberbank.app/api/session" />
      <div className="sim-site">
        <header className="sim-site-head">
          <span className="sim-logo">🔐 CyberBank API</span>
          <span className="sim-user">alice</span>
        </header>
        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={load}>
              <h4>Session token (JWT)</h4>
              <textarea className="sim-field sim-area sim-mono" value={token} onChange={(e) => setToken(e.target.value)} rows="4" spellCheck="false" />
              <div className="sim-row">
                <button type="submit" className="sim-button">Verify token</button>
                <button type="button" className="sim-button ghost" onClick={flipRole}>🔧 Forge role: admin</button>
              </div>
            </form>
            {status ? <div className={`sim-alert ${status.evil ? "err" : "ok"}`}>{status.text}</div> : null}
            <div className="sim-muted sim-hint">
              The server only base64-decodes the payload and trusts whatever role it finds. The signature isn't even checked.
            </div>
          </div>
          <aside className="sim-side">
            <p className="sim-side-title">Hint</p>
            <p className="sim-muted sim-hint">Decode the middle part, change the role to admin, re-encode, and verify.</p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ── 15. NoSQL injection login ───────────────────────────────── */
export function NosqlLogin({ onReveal }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [status, setStatus] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (user.includes("$ne")) {
      setStatus({ ok: true, evil: true, text: `Query: users.findOne({ username: ${user}, password: ${pass || "undefined"} }) → FIRST USER MATCHED! Logged in as admin. FLAG{n0sql_$ne_bypass}` });
      onReveal("FLAG{n0sql_$ne_bypass}");
    } else if (user === "admin" && pass === "Winter2025!") {
      setStatus({ ok: true, evil: false, text: "Welcome back, admin." });
    } else {
      setStatus({ ok: true, evil: false, text: "Login failed. No match in the users collection." });
    }
  };

  return (
    <Shell>
      <BrowserChrome url="https://shop.mongo.app/account/login" />
      <div className="sim-site">
        <header className="sim-site-head">
          <span className="sim-logo">🍃 MongoShop</span>
        </header>
        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={submit}>
              <h4>Sign in</h4>
              <input className="sim-field" value={user} onChange={(e) => setUser(e.target.value)} placeholder='username — try {"$ne":""}' />
              <input className="sim-field" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="password" />
              <button type="submit" className="sim-button">Log in</button>
            </form>
            {status ? <div className={`sim-alert ${status.evil ? "err" : "ok"}`}>{status.text}</div> : null}
          </div>
          <aside className="sim-side">
            <p className="sim-side-title">How it queries</p>
            <p className="sim-muted sim-hint">Your input is dropped straight into a JSON query object. Operators like $ne, $gt, $regex are treated as code, not data.</p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ── 16. Server-side template injection ──────────────────────── */
export function SstiLab({ onReveal }) {
  const [name, setName] = useState("");
  const [output, setOutput] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const n = name || "guest";
    if (n.includes("{{7*7}}")) {
      setOutput({ evil: true, text: `Hello ${n.replace("{{7*7}}", "49")}` });
      onReveal("FLAG{sst1_t3mpl4t3}");
    } else if (/\{\{.*\}\}/.test(n)) {
      setOutput({ evil: true, text: "Hello undefined — looks like the template evaluated something unexpected." });
    } else {
      setOutput({ evil: false, text: `Hello ${n}!` });
    }
  };

  return (
    <Shell>
      <BrowserChrome url="https://welcome.shop.app/greet?name=guest" />
      <div className="sim-site">
        <header className="sim-site-head">
          <span className="sim-logo">🎨 TemplateCloud</span>
        </header>
        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={submit}>
              <h4>Greeting generator</h4>
              <input className="sim-field" value={name} onChange={(e) => setName(e.target.value)} placeholder='name — try {{7*7}}' />
              <button type="submit" className="sim-button">Render greeting</button>
            </form>
            {output ? (
              <div className={`sim-alert ${output.evil ? "err" : "ok"}`}>{output.text}</div>
            ) : null}
          </div>
          <aside className="sim-side">
            <p className="sim-side-title">The vulnerable line</p>
            <p className="sim-muted sim-hint">render("Hello " + name + "!") — your name is evaluated as a template. If the engine evaluates expressions, it's only a few steps from running code.</p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ── 17. XXE ─────────────────────────────────────────────────── */
export function XxeLab({ onReveal }) {
  const sample = `<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<user><name>&xxe;</name></user>`;
  const [xml, setXml] = useState(sample);
  const [output, setOutput] = useState(null);

  const parse = (e) => {
    e.preventDefault();
    if (xml.includes("<!ENTITY") && xml.includes("SYSTEM")) {
      setOutput({ evil: true, text: "Parsed! Name field resolved to: root:x:0:0:root:/root:/bin/bash (file:///etc/passwd). FLAG{xxe_f1le_r3ad}" });
      onReveal("FLAG{xxe_f1le_r3ad}");
    } else {
      setOutput({ evil: false, text: "Parsed successfully. Name: guest." });
    }
  };

  return (
    <Shell>
      <BrowserChrome url="https://api.megacorp.app/import" />
      <div className="sim-site">
        <header className="sim-site-head">
          <span className="sim-logo">📦 MegaCorp Import API</span>
        </header>
        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={parse}>
              <h4>Import user (XML)</h4>
              <textarea className="sim-field sim-area sim-mono" value={xml} onChange={(e) => setXml(e.target.value)} rows="7" spellCheck="false" />
              <button type="submit" className="sim-button">Parse XML</button>
            </form>
            {output ? <div className={`sim-alert ${output.evil ? "err" : "ok"}`}>{output.text}</div> : null}
          </div>
          <aside className="sim-side">
            <p className="sim-side-title">Hint</p>
            <p className="sim-muted sim-hint">External entities can read local files when the parser doesn't disable them.</p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ── 18. CORS misconfiguration ───────────────────────────────── */
export function CorsLab({ onReveal }) {
  const [origin, setOrigin] = useState("https://evil.example.com");
  const [status, setStatus] = useState(null);

  const fetchBalance = () => {
    const evil = origin.includes("evil");
    setStatus(
      evil
        ? { evil: true, text: `Request from ${origin} → server reflects "Access-Control-Allow-Origin: ${origin}" WITH credentials. Response: { balance: 48290, flag: "FLAG{c0rs_r3fl3ct}" }` }
        : { evil: false, text: `Request from ${origin} → blocked (origin not allowed).` }
    );
    if (evil) onReveal("FLAG{c0rs_r3fl3ct}");
  };

  return (
    <Shell>
      <BrowserChrome url="https://cyberbank.app/api/account" />
      <div className="sim-site">
        <header className="sim-site-head">
          <span className="sim-logo">🌐 CyberBank API</span>
        </header>
        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={(e) => { e.preventDefault(); fetchBalance(); }}>
              <h4>Cross-origin request inspector</h4>
              <input className="sim-field" value={origin} onChange={(e) => setOrigin(e.target.value)} spellCheck="false" />
              <button type="submit" className="sim-button">Fetch account balance</button>
            </form>
            {status ? <div className={`sim-alert ${status.evil ? "err" : "ok"}`}>{status.text}</div> : null}
          </div>
          <aside className="sim-side">
            <p className="sim-side-title">What's wrong</p>
            <p className="sim-muted sim-hint">The API echoes back any Origin header AND allows credentials. That combination hands the browser your logged-in data to any page on the internet.</p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ── 19. Open redirect ───────────────────────────────────────── */
export function OpenRedirect({ onReveal }) {
  const [next, setNext] = useState("https://login.app/dashboard");
  const [status, setStatus] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const isExternal = !next.startsWith("https://login.app/");
    setStatus(
      isExternal
        ? { evil: true, text: `Redirecting to ${next} … (the app trusted your ?next= parameter and followed it). FLAG{0p3n_r3d1r3ct}` }
        : { evil: false, text: `Redirecting to ${next} — internal, safe.` }
    );
    if (isExternal) onReveal("FLAG{0p3n_r3d1r3ct}");
  };

  return (
    <Shell>
      <BrowserChrome url="https://login.app/signin?next=%2Fdashboard" />
      <div className="sim-site">
        <header className="sim-site-head">
          <span className="sim-logo">🔐 login.app</span>
        </header>
        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={submit}>
              <h4>Continue to…</h4>
              <input className="sim-field" value={next} onChange={(e) => setNext(e.target.value)} spellCheck="false" />
              <button type="submit" className="sim-button">Continue →</button>
            </form>
            {status ? <div className={`sim-alert ${status.evil ? "err" : "ok"}`}>{status.text}</div> : null}
          </div>
          <aside className="sim-side">
            <p className="sim-side-title">The trick</p>
            <p className="sim-muted sim-hint">The ?next= parameter is trusted as-is. Point it anywhere and you've built a perfectly convincing phishing link.</p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ── 20. Mass assignment (school) ────────────────────────────── */
export function MassAssign({ onReveal }) {
  const [extra, setExtra] = useState("");
  const [status, setStatus] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (/"role"\s*:\s*"admin"/.test(extra) || extra.includes("role") && extra.includes("admin")) {
      setStatus({ ok: true, evil: true, text: "Account created with role=admin! You can now access /staff/console. FLAG{m4ss_4ss1gn}" });
      onReveal("FLAG{m4ss_4ss1gn}");
    } else {
      setStatus({ ok: true, evil: false, text: "Student account created. You are role=student." });
    }
  };

  return (
    <Shell>
      <BrowserChrome url="https://springfield.edu/portal/register" />
      <div className="sim-site school">
        <header className="sim-site-head">
          <span className="sim-logo">🏫 Springfield High Portal</span>
        </header>
        <div className="sim-body">
          <div className="sim-main">
            <form className="sim-form" onSubmit={submit}>
              <h4>Create student account</h4>
              <input className="sim-field" placeholder="name" readOnly value="Johnny Sparks" />
              <input className="sim-field" placeholder="email" readOnly value="js@student.edu" />
              <input className="sim-field" value={extra} onChange={(e) => setExtra(e.target.value)} placeholder='extra JSON — try {"role":"admin"}' spellCheck="false" />
              <button type="submit" className="sim-button">Register</button>
            </form>
            {status ? <div className={`sim-alert ${status.evil ? "err" : "ok"}`}>{status.text}</div> : null}
          </div>
          <aside className="sim-side">
            <p className="sim-side-title">Mass assignment</p>
            <p className="sim-muted sim-hint">The framework binds every submitted field to the account object. Extra fields you send — like role — get set too.</p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/* ── 21. DOM XSS (clinic) ────────────────────────────────────── */
export function DomXss({ onReveal }) {
  const [note, setNote] = useState("");
  const [greeting, setGreeting] = useState("Welcome, patient 2001.");
  const [status, setStatus] = useState(null);

  const update = (e) => {
    e.preventDefault();
    setGreeting(`Welcome, ${note || "patient 2001"}.`);
    if (/<script|onerror=/.test(note)) {
      setStatus({ ok: true, evil: true, text: "alert('PHI leak') ran in your browser — the value from the URL hash was written with innerHTML. FLAG{d0m_xss_p0rtal}" });
      onReveal("FLAG{d0m_xss_p0rtal}");
    } else {
      setStatus({ ok: true, evil: false, text: "Patient record loaded." });
    }
  };

  return (
    <Shell>
      <BrowserChrome url="https://carenow.app/portal/#welcome" />
      <div className="sim-site health">
        <header className="sim-site-head">
          <span className="sim-logo">🏥 CareNow Clinic</span>
          <span className="sim-user">patient_portal</span>
        </header>
        <div className="sim-body">
          <div className="sim-main">
            <div className="sim-alert ok">{greeting}</div>
            <form className="sim-form" onSubmit={update}>
              <h4>Set patient greeting</h4>
              <input className="sim-field" value={note} onChange={(e) => setNote(e.target.value)} placeholder='greeting — try <img src=x onerror=alert(1)>' />
              <button type="submit" className="sim-button">Render</button>
            </form>
            {status ? <div className={`sim-alert ${status.evil ? "err" : "ok"}`}>{status.text}</div> : null}
          </div>
          <aside className="sim-side">
            <p className="sim-side-title">DOM XSS</p>
            <p className="sim-muted sim-hint">The value never reaches the server — it's read from the URL and written into the page with innerHTML. That's a DOM-based XSS.</p>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
