const rooms = [
  {
    id: "sqli",
    title: "ShopLift — SQL Injection",
    short: "Bypass the login and dump the whole database with one payload.",
    difficulty: "Medium",
    stars: 4,
    estTime: "8 min",
    points: 180,
    category: "Injection",
    chainTitle: "Info Leak → Injection → Data Exfiltration",
    story:
      "ShopLift is a small e-commerce site. The login form looks innocent, but the developer built the query by pasting user input straight into the SQL string. No prepared statements, no validation — just concatenation.",
    owasp: {
      code: "A05:2025",
      name: "Injection",
      rank: 5,
      desc: "Untrusted data is sent to an interpreter as part of a command or query. The interpreter executes unintended commands or accesses data without authorization.",
    },
    cwe: "CWE-89",
    cves: [
      {
        id: "CVE-2023-25157",
        name: "GeoServer OGC Filter SQL Injection",
        score: "9.8",
        year: "2023",
        desc: "Unauthenticated SQL injection via crafted CQL_FILTER values in GeoServer WFS/WMS requests — full database compromise.",
        vector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      },
      {
        id: "CVE-2017-8917",
        name: "Joomla! com_fields SQL Injection",
        score: "9.8",
        year: "2017",
        desc: "SQL injection in Joomla! 3.7.0 let attackers execute arbitrary SQL against the site database before the 3.7.1 patch.",
        vector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      },
    ],
    cvss: {
      vector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      score: 9.8,
      severity: "Critical",
      breakdown: [
        { key: "AV:N", label: "Attack Vector", value: "Network", note: "Exploitable remotely over HTTP" },
        { key: "AC:L", label: "Attack Complexity", value: "Low", note: "No special conditions or races required" },
        { key: "PR:N", label: "Privileges Required", value: "None", note: "No account needed to reach the login form" },
        { key: "UI:N", label: "User Interaction", value: "None", note: "No victim action required" },
        { key: "S:U", label: "Scope", value: "Unchanged", note: "Impact stays inside the application" },
        { key: "C:H", label: "Confidentiality", value: "High", note: "The entire database can be read" },
        { key: "I:H", label: "Integrity", value: "High", note: "Rows can be modified or deleted" },
        { key: "A:H", label: "Availability", value: "High", note: "Tables can be dropped entirely" },
      ],
    },
    prevention: {
      vulnerableCode: `$user = $_POST['username'];
$pass = $_POST['password'];

$sql = "SELECT * FROM users
        WHERE username='$user' AND password='$pass'";

$rows = $db->query($sql);`,
      secureCode: `$sql = "SELECT * FROM users
          WHERE username = ? AND password = ?";

$stmt = $db->prepare($sql);
$stmt->execute([$user, $pass]);
$user = $stmt->fetch();`,
      checklist: [
        "Use parameterized queries / prepared statements everywhere",
        "Validate and whitelist all user input server-side",
        "Run the database under a least-privilege account",
        "Store passwords as salted hashes (bcrypt / argon2)",
        "Never surface database errors to the client",
        "Add rate limiting and WAF rules for injection patterns",
      ],
    },
    chainImpact:
      "A single unvalidated login field cascades into a full database compromise: authentication bypass, credential theft, and mass data exfiltration.",
    steps: [
      {
        id: "s1",
        kind: "text",
        title: "Recon: Information Leak",
        objective:
          "Open ShopLift's login page and look closely at the page footer — the framework is bragging about itself. What database engine is the app built on? (e.g. mysql, postgresql)",
        scenario: `ShopLift — Sign in

  [ Username            ]
  [ Password            ]
  [     SIGN IN     ]

────────────────────────────────────────────
© 2025 ShopLift — Powered by MySQL 8.0 Community`,
        answers: ["mysql", "mysql 8.0", "mysql8", "mysql 8", "mysql 8.0 community", "mysql 8.0 community edition"],
        hint: "It's the word right before the version number in the footer.",
        teach:
          "The footer reveals the exact database engine. Attackers collect these breadcrumbs to craft engine-specific payloads. This information leak is the first link in the chain: it primes the injection.",
        mistake:
          "Developers ship default framework banners into production instead of removing or masking them.",
      },
      {
        id: "s2",
        kind: "text",
        title: "Exploit: SQL Injection at the Login",
        objective:
          "The login query is built by concatenating your username straight into the SQL string. Enter a payload in the username field that makes the WHERE clause always TRUE, logging you in as the first user (admin) without a password.",
        scenario: `  username: [ ___________________________ ]
  password: [ ******** ]

  $sql = "SELECT * FROM users
          WHERE username='$user' AND password='$pass'";

  > Query returned 1 row → logged in as admin`,
        answers: [
          "' or '1'='1",
          "' or 1=1",
          "' or 1=1--",
          "' or 1=1 --",
          "' or 1=1#",
          "' or '1'='1'--",
          "' or '1'='1' #",
          "' or '1'='1'-- -",
          "' or 1=1-- -",
          "admin' or '1'='1'--",
          "admin' or 1=1--",
          "admin' or '1'='1' #",
        ],
        hint: "Close the single quote, then add a condition that is always true. For example: ' OR '1'='1",
        teach:
          "By injecting ' OR '1'='1 you close the username string and append a condition that is always TRUE. The query now returns the first row — no password needed. This is SQL injection: untrusted input becomes SQL code.",
        mistake:
          "The developer used string concatenation instead of prepared statements, trusting the client to send 'safe' input.",
      },
      {
        id: "s3",
        kind: "text",
        title: "Escalate: Dump the Admin Hash",
        objective:
          "You're in as admin. The product search has a second injection and returns 3 columns. Use a UNION SELECT to pull the admin's password hash. What flag is stored next to it?",
        scenario: `  ?q=search → SELECT id, name, price FROM products
              WHERE name LIKE '%$q%'

  [ search: ________________ ]

  Try: 1' UNION SELECT 1, username, password FROM users#

  → ID:1 | admin | FLAG{7h3y_trust3d_th3_1nput}`,
        answers: ["flag{7h3y_trust3d_th3_1nput}", "flag{7h3y trust3d th3 1nput}"],
        hint: "Append UNION SELECT to the vulnerable search and align the columns with the flag value.",
        teach:
          "UNION lets you append a second SELECT to the original query. Because you matched the column count, you can read any table — here, usernames and password hashes straight out of users.",
        mistake:
          "The product search ran another concatenated query, and the database account had far more privileges than the feature needed.",
      },
      {
        id: "s4",
        kind: "choice",
        title: "Impact: Chain Explosion",
        objective:
          "Step back and look at the whole chain you just executed. How would a security team classify it?",
        options: [
          "A denial-of-service on the search page",
          "An authentication bypass that escalates to full database takeover",
          "A cross-site scripting flaw in the footer",
          "A misconfigured session cookie",
        ],
        correct: 1,
        hint: "Think about everything you touched: login, search, users table.",
        teach:
          "The chain started with an info leak (recon), became an authentication bypass, and ended in full database exposure. Each link raised the impact — that's exactly how real attackers chain low-severity findings into critical breaches.",
        mistake:
          "No single fix handles the chain; every link (leak, concatenation, over-privileged DB account) must be addressed.",
      },
    ],
  },
  {
    id: "idor",
    title: "NovaBank — IDOR",
    short: "Read other customers' invoices by changing one number in the URL.",
    difficulty: "Easy",
    stars: 3,
    estTime: "6 min",
    points: 150,
    category: "Broken Access Control",
    chainTitle: "Object Reference → IDOR → Sensitive Data Exposure",
    story:
      "NovaBank shows you your invoices. Each one lives at a URL with a sequential id. The server checks that you're logged in — but it never checks whether the invoice actually belongs to you.",
    owasp: {
      code: "A01:2025",
      name: "Broken Access Control",
      rank: 1,
      desc: "Restrictions on what authenticated users are allowed to do are not properly enforced, letting users act outside of their intended permissions.",
    },
    cwe: "CWE-639",
    cves: [
      {
        id: "CVE-2024-32166",
        name: "Webid IDOR / Broken Access Control",
        score: "6.5",
        year: "2024",
        desc: "Insecure direct object reference in Webid 1.2.1 lets a user act on another user's auction object (horizontal privilege escalation).",
        vector: "AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N",
      },
      {
        id: "CVE-2023-33706",
        name: "SysAid IDOR on Ticket Data",
        score: "6.5",
        year: "2023",
        desc: "SysAid allowed IDOR attacks that read arbitrary ticket data via a modified sid parameter before version 23.2.15.",
        vector: "AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N",
      },
    ],
    cvss: {
      vector: "AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N",
      score: 6.5,
      severity: "High",
      breakdown: [
        { key: "AV:N", label: "Attack Vector", value: "Network", note: "Reachable over HTTP from anywhere" },
        { key: "AC:L", label: "Attack Complexity", value: "Low", note: "Just change one number in the URL" },
        { key: "PR:L", label: "Privileges Required", value: "Low", note: "Attacker needs an ordinary account" },
        { key: "UI:N", label: "User Interaction", value: "None", note: "Victim does nothing" },
        { key: "S:U", label: "Scope", value: "Unchanged", note: "Impact stays inside the banking app" },
        { key: "C:H", label: "Confidentiality", value: "High", note: "Every customer's financial records are readable" },
        { key: "I:N", label: "Integrity", value: "None", note: "Read access only" },
        { key: "A:N", label: "Availability", value: "None", note: "Data is not destroyed" },
      ],
    },
    prevention: {
      vulnerableCode: `app.get('/account/invoice', (req, res) => {
  const invoice = db.get(
    'SELECT * FROM invoices WHERE id = ?',
    req.query.id
  );
  res.json(invoice); // no ownership check
});`,
      secureCode: `app.get('/account/invoice', (req, res) => {
  const invoice = db.get(
    'SELECT * FROM invoices WHERE id = ? AND user_id = ?',
    req.query.id,
    req.session.userId
  );
  res.json(invoice || { error: 'Not found' });
});`,
      checklist: [
        "Authorize the object, not just the session — verify ownership on every request",
        "Use unpredictable identifiers (UUIDs) instead of sequential ids",
        "Default-deny: return 404 when the object doesn't belong to the caller",
        "Centralize authorization checks instead of scattering them",
        "Log denied attempts and alert on enumeration patterns",
      ],
    },
    chainImpact:
      "One sequential id plus a missing ownership check means any logged-in customer can read every other customer's financial records — horizontal privilege escalation into mass sensitive-data exposure.",
    steps: [
      {
        id: "s1",
        kind: "text",
        title: "Recon: Spot the Object Reference",
        objective:
          "Open NovaBank and click 'My Invoice'. Look at the URL — a raw internal identifier is in the address bar. What query parameter references the invoice?",
        scenario: `NovaBank — My Invoice

  https://novabank.app/account/invoice?id=1042

  Invoice #1042  ·  You
  Amount: $249.00
  Issued: 12 Apr 2026

  "invoices are issued sequentially"`,
        answers: ["id", "?id", "id=1042", "invoice", "the id parameter"],
        hint: "It's the word before the equals sign in the URL.",
        teach:
          "The URL hands you a direct reference to an internal object: id=1042. Sequential ids make it trivial to guess neighbouring objects — this is the seed of an IDOR.",
        mistake:
          "The developer exposed the internal database key directly in the URL and assumed users would never change it.",
      },
      {
        id: "s2",
        kind: "text",
        title: "Exploit: Change the ID",
        objective:
          "Your invoice is 1042. Another customer's invoice was issued just before yours. Change the id in the URL to read their invoice. What flag is hidden inside it?",
        scenario: `  GET /account/invoice?id=1041

  HTTP/1.1 200 OK

  Invoice #1041 · Marcus Reed
  Account balance: $48,290.00
  Private note: FLAG{n0_0wn3rsh1p_ch3ck}`,
        answers: ["flag{n0_0wn3rsh1p_ch3ck}", "flag{n0 0wn3rsh1p ch3ck}"],
        hint: "Request the invoice issued just before yours — id=1041.",
        teach:
          "You changed one number and the server happily returned another customer's private financial record. The app verified your session, but never verified that the invoice belonged to you.",
        mistake:
          "The developer trusted the client-supplied id and skipped the ownership check on the server.",
      },
      {
        id: "s3",
        kind: "choice",
        title: "Impact: Horizontal Privilege Escalation",
        objective:
          "You accessed data belonging to another user at the same privilege level. What is this called?",
        options: [
          "Vertical privilege escalation",
          "Insecure Direct Object Reference (IDOR) / horizontal privilege escalation",
          "Server-Side Request Forgery",
          "Cross-Site Request Forgery",
        ],
        correct: 1,
        hint: "Same level of privilege, different user's object.",
        teach:
          "Accessing another user's objects at the same privilege level is horizontal privilege escalation — the classic IDOR. Reaching an admin-only object would have been vertical.",
        mistake:
          "No object-level authorization existed between the session and the data.",
      },
      {
        id: "s4",
        kind: "choice",
        title: "Impact: Sensitive Data Exposure",
        objective:
          "One changed number gave you another customer's financial record. Chain this together — what class of impact does the platform now face?",
        options: [
          "A minor cosmetic bug",
          "Mass unauthorized disclosure of customer financial data",
          "A distributed denial of service",
          "A phishing email campaign",
        ],
        correct: 1,
        hint: "Consider how many ids exist and what data they point to.",
        teach:
          "Sequential ids + no ownership checks + sensitive stored data = every invoice in the bank is readable by any customer. A single IDOR becomes a mass data breach.",
        mistake:
          "Sensitive data was reachable through an unguarded object reference with no audit trail.",
      },
    ],
  },
];

export default rooms;
