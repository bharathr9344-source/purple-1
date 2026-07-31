export const courses = [
  {
    id: "sqli",
    title: "SQL Injection",
    tagline: "From zero to breaking a login with one payload.",
    owasp: "A05:2025 Injection",
    roomId: "sqli",
    minutes: 12,
    icon: "💉",
    chapters: [
      {
        id: "ch1",
        title: "Databases & SQL basics",
        slides: [
          {
            h: "What is a database?",
            body: "A database stores data in tables — like spreadsheets. A table has columns (fields) and rows (records).",
            points: ["An online shop has a users table and a products table", "Each user is one row: username, password, email…", "Apps read and write these tables every second"],
          },
          {
            h: "The SELECT statement",
            body: "SQL is the language apps use to talk to the database. Almost every read starts with SELECT.",
            code: `SELECT * FROM users
WHERE username = 'alice';`,
            points: ["* means 'all columns'", "WHERE filters which rows are returned", "Note the single quotes around text values"],
          },
          {
            h: "How an app builds a query",
            body: "When you type a username, the app fills it into a SQL template and runs the query to check your login.",
            code: `SELECT * FROM users
WHERE username = 'alice' AND password = 'hunter2';`,
            points: ["If a row comes back, you're logged in", "The app trusted your input and put it into the query — that's where the danger lives"],
          },
        ],
      },
      {
        id: "ch2",
        title: "What is SQL Injection?",
        slides: [
          {
            h: "The definition",
            body: "SQL Injection (SQLi) happens when untrusted input is pasted directly into a SQL query — so the input becomes part of the code, not just a value.",
            points: ["Your input should be treated as data", "When it isn't, the database runs whatever the input tells it to", "OWASP ranks Injection #5 in the 2025 Top 10"],
          },
          {
            h: "The vulnerable pattern",
            body: "String concatenation is the classic mistake. The quotes in your input close the string and break out into SQL.",
            code: `// BAD — never do this
$sql = "SELECT * FROM users
        WHERE username='$user'
          AND password='$pass'";`,
            points: ["$user comes straight from the form", "The database sees the final string — not the original variables"],
          },
        ],
      },
      {
        id: "ch3",
        title: "Anatomy of the exploit",
        slides: [
          {
            h: "Closing the quote, forcing TRUE",
            body: "To bypass the login we close the username quote and add a condition that is always true. Now the password check doesn't matter.",
            code: `Input:   ' OR '1'='1

Query:   SELECT * FROM users
         WHERE username='' OR '1'='1'
           AND password='x'

→ Every row matches → first row returned → logged in!`,
            points: ["' closes the username string", "OR '1'='1 is always true", "The whole WHERE clause now passes"],
          },
          {
            h: "Why this works",
            body: "The server checks whether ANY row matches. It never checks that the row is really you. The query returns the first user — usually admin.",
            points: ["No password is ever verified", "The logic is changed, not just tricked", "This is an authentication bypass"],
          },
        ],
      },
      {
        id: "ch4",
        title: "Step-by-step: bypass the login",
        slides: [
          {
            h: "Your first payload",
            body: "Open ShopLift and type this into the username field. Leave the password empty. Watch the query at the bottom of the form live.",
            code: `' OR '1'='1`,
            points: ["Step 1 — click into the username field", "Step 2 — paste the payload", "Step 3 — press Sign in and watch the query change", "Step 4 — the query returns 1 row: you're admin"],
          },
          {
            h: "Trying it yourself",
            body: "Don't just read it — type it. The live query panel shows exactly how your input becomes SQL. When you're comfortable, head to the room.",
            points: ["Try ' OR 1=1# too — MySQL treats # as a comment", "Try closing with -- (double dash) for other databases"],
          },
        ],
      },
      {
        id: "ch5",
        title: "Escalation: reading everything with UNION",
        slides: [
          {
            h: "UNION lets you add a second query",
            body: "UNION appends the rows of a second SELECT to the first one's results. If you match the column count, the database returns both.",
            code: `1' UNION SELECT 1, username, password FROM users#`,
            points: ["The product search returns 3 columns", "UNION SELECT must return the same number of columns", "# comments out the rest of the original query"],
          },
          {
            h: "What you just stole",
            body: "Usernames and password hashes dump straight out of the users table — full data exfiltration from a single search box.",
            points: ["This is why least-privilege DB accounts matter", "In the room, the admin's hash is stored next to a FLAG"],
          },
        ],
      },
      {
        id: "ch6",
        title: "Impact, fixes & practice",
        slides: [
          {
            h: "The chain so far",
            body: "Info leak → authentication bypass → database takeover. One unvalidated input cascades into a critical breach (CVSS 9.8).",
            points: ["Authentication bypass is just the start", "Attackers dump hashes, then pivot to other systems"],
          },
          {
            h: "How to fix it",
            body: "The golden rule: input must never become code. Use prepared statements everywhere.",
            code: `$stmt = $db->prepare(
  "SELECT * FROM users WHERE username = ? AND password = ?"
);
$stmt->execute([$user, $pass]);`,
            points: ["Prepared statements separate data from code", "Validate and whitelist input server-side", "Run the DB with least privilege", "Never show raw database errors"],
          },
          {
            h: "Practice it",
            body: "You've learned the theory. Now exploit it for real in the ShopLift room and capture the flags.",
            points: ["Head to the Learn → Playground to hunt flags free-form", "Or start the ShopLift room for the guided chain"],
          },
        ],
      },
    ],
  },
  {
    id: "idor",
    title: "Broken Access Control (IDOR)",
    tagline: "One changed number in a URL, and you're inside someone else's account.",
    owasp: "A01:2025 Broken Access Control",
    roomId: "idor",
    minutes: 10,
    icon: "🔑",
    chapters: [
      {
        id: "ch1",
        title: "Objects & references",
        slides: [
          {
            h: "What is an object reference?",
            body: "Applications manage objects: invoices, files, accounts. Each object has an identifier — often the row's database id.",
            code: `https://novabank.app/account/invoice?id=1042`,
            points: ["1042 is the invoice's identifier", "The id is sequential — one number apart from the next", "It's right there in the URL, easy to edit"],
          },
          {
            h: "Who should see what",
            body: "You should only be able to open YOUR objects. The server must check ownership on every request — not just whether you're logged in.",
            points: ["Login ≠ authorization", "Authorization asks: does this object belong to YOU?"],
          },
        ],
      },
      {
        id: "ch2",
        title: "The bug: no ownership check",
        slides: [
          {
            h: "The vulnerable pattern",
            body: "The code fetches the invoice by id and returns it. It never compares the invoice's owner to the logged-in user.",
            code: `// BAD — no ownership check
app.get('/account/invoice', (req, res) => {
  const invoice = db.get(
    'SELECT * FROM invoices WHERE id = ?',
    req.query.id
  );
  res.json(invoice);
});`,
            points: ["req.query.id comes straight from the URL", "Any logged-in user can request any id", "The server says yes every time"],
          },
        ],
      },
      {
        id: "ch3",
        title: "What is IDOR?",
        slides: [
          {
            h: "Insecure Direct Object Reference",
            body: "IDOR means the app exposes a direct reference to an internal object (like a database id) and fails to verify you're allowed to access that specific object.",
            points: ["You have a valid session — that's not enough", "The object reference is directly usable: just change the number", "OWASP ranks Broken Access Control #1 in 2025"],
          },
          {
            h: "Why it's so common",
            body: "Developers test the happy path (their own id) and forget the unhappy path (everyone else's id). The fix is one extra condition in the WHERE clause.",
            points: ["Sequential ids make guessing trivial", "No brute force needed — just count down from your own id"],
          },
        ],
      },
      {
        id: "ch4",
        title: "Step-by-step: change the id",
        slides: [
          {
            h: "Your first IDOR",
            body: "In NovaBank, your invoice is id=1042. Open it, then edit the address bar to 1041 and press Go.",
            code: `id=1042  →  your invoice
id=1041  →  Marcus Reed's invoice  ← not yours!`,
            points: ["Step 1 — open NovaBank → My Invoice", "Step 2 — edit the id in the address bar", "Step 3 — press Go and read someone else's record", "Step 4 — find the FLAG in the private note"],
          },
          {
            h: "What just happened",
            body: "The server verified your session but never checked ownership. You moved horizontally — same privilege level, different user's data.",
            points: ["Horizontal escalation: peer to peer", "Do it against an admin id and it becomes vertical"],
          },
        ],
      },
      {
        id: "ch5",
        title: "Impact: horizontal vs vertical",
        slides: [
          {
            h: "Climbing the chain",
            body: "One changed number gave you a stranger's financial record. Count through every sequential id and you can read the whole bank.",
            points: ["Horizontal: access data at your own level", "Vertical: escalate toward admin privileges", "Multiplied by N ids = mass data breach (CVSS 6.5+)"],
          },
        ],
      },
      {
        id: "ch6",
        title: "Fix & practice",
        slides: [
          {
            h: "How to fix it",
            body: "Authorize the object, not just the session. Add the owner to the query and return 404 when there's no match.",
            code: `app.get('/account/invoice', (req, res) => {
  const invoice = db.get(
    'SELECT * FROM invoices
     WHERE id = ? AND user_id = ?',
    req.query.id,
    req.session.userId
  );
  res.json(invoice || { error: 'Not found' });
});`,
            points: ["The query now requires the owner", "Nothing matches → 404, no info leaked", "Use UUIDs instead of sequential ids"],
          },
          {
            h: "Practice it",
            body: "Open NovaBank in the playground and hunt the flag, or follow the guided room for the full chain analysis.",
            points: ["Playground: change the id until you find the flag", "Room: get OWASP + CVSS + CVE analysis"],
          },
        ],
      },
    ],
  },
];

export function findCourse(id) {
  return courses.find((c) => c.id === id);
}
