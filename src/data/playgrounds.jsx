import { PlaygroundApps as treasury } from "../utils/playgroundApps";
import CyberBank from "../components/sites/CyberBank";
import Springfield from "../components/sites/Springfield";
import CareNow from "../components/sites/CareNow";
import ShopLift from "../components/sites/ShopLift";
import OwaspPortal from "../components/sites/OwaspPortal";
import TeaShop from "../components/sites/TeaShop";

const TREASURY_META = {
  novabank: {
    difficulty: "easy",
    cve: { id: "CVE-2024-32166", name: "Webid IDOR / Broken Access Control", score: "6.5", desc: "Insecure direct object reference letting a user act on another user's object — horizontal privilege escalation." },
  },
  "shoplift-login": {
    difficulty: "easy",
    cve: { id: "CVE-2017-8917", name: "Joomla! com_fields SQL Injection", score: "9.8", desc: "SQL injection letting unauthenticated attackers execute arbitrary SQL against the database." },
  },
  "shoplift-search": {
    difficulty: "medium",
    cve: { id: "CVE-2023-25157", name: "GeoServer OGC Filter SQL Injection", score: "9.8", desc: "Unauthenticated SQL injection via crafted filter values — full database compromise." },
  },
  "sqli-blind": {
    difficulty: "medium",
    cve: { id: "CVE-2023-25157", name: "Blind SQL Injection (Boolean-Based)", score: "9.8", desc: "No error or data output — the attacker extracts information one TRUE/FALSE answer at a time." },
  },
  "sqli-union": {
    difficulty: "medium",
    cve: { id: "CVE-2023-25157", name: "UNION-Based SQL Injection", score: "9.8", desc: "The injection point feeds a result set, letting UNION SELECT dump arbitrary columns and tables." },
  },
  "sqli-waf": {
    difficulty: "medium",
    cve: { id: "CVE-2023-25157", name: "SQL Injection via WAF Bypass", score: "9.8", desc: "Keyword filtering (or/and/comments) bypassed with operators like || or hex encoding." },
  },
  "priv-esc": {
    difficulty: "medium",
    cve: { id: "CVE-2021-22986", name: "JWT-Based Privilege Escalation", score: "9.1", desc: "Trading an unauthenticated user token for role=admin by forging an unsigned JWT." },
  },
  "xss-guestbook": {
    difficulty: "easy",
    cve: { id: "CVE-2020-35846", name: "Cockpit CMS Stored XSS", score: "6.1", desc: "Stored cross-site scripting in user-supplied content that runs for every visitor." },
  },
  "cmd-ping": {
    difficulty: "medium",
    cve: { id: "CVE-2023-41425", name: "WP Plugin Command Injection", score: "9.8", desc: "User input passed to a shell command, allowing arbitrary remote command execution." },
  },
  "path-traversal": {
    difficulty: "easy",
    cve: { id: "CVE-2019-11510", name: "Pulse Secure Path Traversal", score: "10.0", desc: "Arbitrary file read via ../ in a file parameter — server credentials stolen at scale." },
  },
  ssrf: {
    difficulty: "medium",
    cve: { id: "CVE-2021-22005", name: "VMware vCenter SSRF", score: "9.8", desc: "Server-side request forgery allowing access to internal services and metadata." },
  },
  upload: {
    difficulty: "medium",
    cve: { id: "CVE-2022-24112", name: "Apache APISIX Upload RCE", score: "9.8", desc: "Unrestricted file upload leading to remote code execution on the server." },
  },
  "jwt-forgery": {
    difficulty: "easy",
    cve: { id: "CVE-2021-22986", name: "F5 iControl REST Auth Bypass", score: "9.8", desc: "Authentication bypass by abusing trust in client-supplied tokens — the same mistake as an unsigned JWT." },
  },
  "nosql-injection": {
    difficulty: "easy",
    cve: { id: "CVE-2021-22986", name: "Auth Bypass via Operator Injection", score: "9.1", desc: "NoSQL operator injection letting an attacker bypass authentication checks entirely." },
  },
  ssti: {
    difficulty: "medium",
    cve: { id: "CVE-2023-32784", name: "SSTI in Template Engines", score: "8.1", desc: "User input evaluated inside a server-side template, escalating to code execution." },
  },
  xxe: {
    difficulty: "medium",
    cve: { id: "CVE-2022-41040", name: "XXE in XML Parsers", score: "8.8", desc: "External entities enabled in an XML parser allow local file reads and internal probing." },
  },
  cors: {
    difficulty: "medium",
    cve: { id: "CVE-2021-22986", name: "CORS Origin Reflection", score: "7.5", desc: "Server reflects arbitrary origins with credentials, leaking authenticated responses cross-site." },
  },
  "open-redirect": {
    difficulty: "easy",
    cve: { id: "CVE-2019-18810", name: "Open Redirect in Auth Flows", score: "4.3", desc: "Trusted redirect parameters forwarded to attacker-controlled destinations, enabling phishing." },
  },
  "mass-assignment": {
    difficulty: "easy",
    cve: { id: "CVE-2017-8917", name: "Mass Assignment Privilege Escalation", score: "7.5", desc: "Request fields bound directly to privileged object attributes, escalating role to admin." },
  },
  "dom-xss": {
    difficulty: "easy",
    cve: { id: "CVE-2020-35846", name: "DOM-Based Cross-Site Scripting", score: "6.1", desc: "Client-side only XSS from unsafe DOM sinks, invisible to server-side filters." },
  },
};

const DIFF_RANK = { easy: 0, medium: 1, hard: 2 };

const treasuryApps = treasury
  .map((app) => {
    const meta = TREASURY_META[app.id] || { difficulty: "medium", cve: null };
    return { ...app, difficulty: meta.difficulty, cve: meta.cve };
  })
  .sort((a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty]);

export const playgrounds = [
  {
    id: "treasury",
    name: "Vulnerable Treasure",
    emoji: "💎",
    theme: "Juice Shop–style challenge board",
    difficulty: "Guided · Easy → Hard",
    story:
      "One busy e-commerce site — ShopLift — stuffed end to end with vulnerable features: sign-in, product search, guestbook, invoices, seller tools, a session panel and more. Twenty distinct bug classes are hiding in plain sight, from beginner 'OR 1=1' logins to blind SQLi, UNION leaks and WAF bypasses. Wander the app like a pentester and confirm every finding; each one maps to a real OWASP class and real CVE. It all runs sandboxed in your browser and can never touch the real host.",
    guided: true,
    chain: [
      "Recon the app surface — every feature is a lead",
      "Pick a bug class per page",
      "Exploit the flaw inside the live page",
      "Confirm the finding and move on",
      "Map each finding to OWASP + real CVEs",
    ],
    site: ({ onReveal }) => <ShopLift onReveal={onReveal} />,
    supplyChain: false,
    impact:
      "A working, hands-on grasp of every major web attack class in the OWASP Top 10.",
    cves: [
      { id: "CVE-2023-25157", name: "GeoServer OGC Filter SQL Injection", score: "9.8", year: "2023", desc: "Unauthenticated SQL injection via crafted CQL_FILTER values — full database compromise." },
      { id: "CVE-2017-8917", name: "Joomla! com_fields SQL Injection", score: "9.8", year: "2017", desc: "SQL injection in Joomla! 3.7.0 letting attackers run arbitrary SQL." },
      { id: "CVE-2024-32166", name: "Webid IDOR / Broken Access Control", score: "6.5", year: "2024", desc: "Insecure direct object reference enabling horizontal privilege escalation." },
      { id: "CVE-2023-33706", name: "SysAid IDOR on Ticket Data", score: "6.5", year: "2023", desc: "IDOR attack reading arbitrary ticket data via a modified parameter." },
    ],
    cvss: { vector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", score: 9.8, severity: "Critical" },
    practices: [
      "Validate and whitelist every input server-side",
      "Use prepared statements everywhere",
      "Encode all output — never trust user content",
      "Authorize the object, not just the session",
      "Never pass user input to shell commands",
      "Run services with least privilege",
      "Keep dependencies patched and maintain an SBOM",
      "Never store secrets in the front end or logs",
    ],
    apps: treasuryApps,
  },
  {
    id: "school",
    name: "Springfield High Portal",
    emoji: "🏫",
    theme: "Education",
    difficulty: "Medium",
    story:
      "One school portal, running on a cheap third-party attendance plugin. Walk through the portal, login, staff tools, fees and registration — a student account becomes full control of the school's database and billing.",
    chain: [
      "Recon the portal: a student account and a leaked staff password",
      "Login as staff via the message-board reset (weak auth)",
      "Staff dashboard exposes the database console",
      "Tamper with student fee records in the database",
      "Escalate to admin through mass assignment on registration",
    ],
    site: ({ onReveal }) => <Springfield onReveal={onReveal} />,
    supplyChain: true,
    supplyChainNote:
      "The breach began before anyone typed a password: the school's supplier shipped a plugin whose logging library is vulnerable to CVE-2021-44228 (Log4Shell). A student triggered the logger to pull staff credentials out of memory — a textbook software-supply-chain attack: the trusted vendor, not the school's own code, was the weak link.",
    impact:
      "A student account becomes full control of the school's database and billing data.",
    cves: [
      { id: "CVE-2021-44228", name: "Apache Log4j2 'Log4Shell'", score: "10.0", year: "2021", desc: "Remote code execution in a ubiquitous logging library — the canonical software supply-chain vulnerability. A crafted log message triggers JNDI lookups." },
      { id: "CVE-2023-25157", name: "GeoServer OGC Filter SQL Injection", score: "9.8", year: "2023", desc: "Unauthenticated SQL injection letting attackers read and write the database — the same class as the exposed DB console." },
    ],
    cvss: { vector: "AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H", score: 8.8, severity: "High" },
    practices: [
      "Know your supply chain: keep an SBOM and patch third-party libraries immediately",
      "Never reset passwords to values posted on public channels",
      "Require MFA on privileged (staff/admin) accounts",
      "Use prepared statements for every database query",
      "Enforce server-side authorization on every staff endpoint",
      "Bind only allowed fields on account creation (mass assignment)",
      "Run the database under a least-privilege account",
      "Encrypt sensitive data at rest and keep audit logs",
    ],
    apps: [
      {
        id: "school-login",
        name: "Staff Login",
        category: "Broken Authentication · OWASP #7",
        filter: "access",
        difficulty: "easy",
        goal: "A staff password was reset and posted where everyone can see it. Find it, log in, and capture the flag.",
        flag: "FLAG{st4ff_1nt3rn4l_4cc}",
        hint: "Expand the 'Forgot password?' panel — resets are posted on the message board.",
        learn:
          "Weak authentication hygiene: credentials reset through an unauthenticated public channel. Fix: secure reset flows (one-time links), MFA, and never post secrets.",
        cve: { id: "CVE-2021-44228", name: "Log4Shell", score: "10.0", desc: "The supply-chain logging flaw used to reach staff credentials." },
      },
      {
        id: "school-db",
        name: "Database Console",
        category: "Broken Access Control + SQLi · OWASP #1/#3",
        filter: "access",
        difficulty: "easy",
        goal: "The plugin exposed its database console to staff. Query the fees table to grab the flag.",
        flag: "FLAG{db_n0_authz}",
        hint: "Run: SELECT * FROM fees",
        learn:
          "No authorization on a privileged tool, plus the DB account has too much access. Fix: central authorization, least-privilege DB roles, prepared statements.",
        cve: { id: "CVE-2023-25157", name: "GeoServer OGC Filter SQL Injection", score: "9.8", desc: "The same 'query from the app, no authz' class." },
      },
      {
        id: "school-fees",
        name: "Fee Records",
        category: "Broken Access Control / Integrity · OWASP #1",
        filter: "access",
        difficulty: "medium",
        goal: "The fees API checks you're logged in but never checks your role. Modify another student's fee and capture the flag.",
        flag: "FLAG{f33_74mp3r1ng}",
        hint: "Pick a student other than yourself and save a fee.",
        learn:
          "Missing object-level + role-level authorization lets any authenticated user tamper with financial records. Fix: verify the actor may edit that exact record, and sign/audit all changes.",
        cve: { id: "CVE-2024-32166", name: "Webid IDOR", score: "6.5", desc: "Acting on another user's object without authorization." },
      },
      {
        id: "school-mass",
        name: "Mass Assignment",
        category: "Mass Assignment · OWASP #1",
        filter: "access",
        difficulty: "easy",
        goal: "The registration form binds every submitted field to the account. Add a role field and become admin.",
        flag: "FLAG{m4ss_4ss1gn}",
        hint: "Append {\"role\":\"admin\"} to the form payload.",
        learn:
          "Mass Assignment: the framework binds all request fields straight onto the account object, so a hidden role field silently escalates privileges. Fix: explicit allowlists of bindable fields (DTOs), never bind request bodies wholesale.",
        cve: { id: "CVE-2017-8917", name: "Mass Assignment Privilege Escalation", score: "7.5", desc: "Request fields bound directly to privileged object attributes." },
      },
    ],
  },
  {
    id: "bank",
    name: "CyberBank · Integrated App",
    emoji: "🏦",
    theme: "Finance",
    difficulty: "Hard",
    story:
      "One real-looking banking application. Log in as a normal customer and work the whole app like a pentester — statements, transfers, support messages, session settings and a developer API console. Six separate vulnerabilities are hiding in plain sight across its pages.",
    chain: [
      "Recon the CyberBank app surface — every page is a lead",
      "Read another customer's statement (IDOR)",
      "Forge the session cookie to reach the Admin Console",
      "Trigger an unauthorized transfer via a CSRF 'email image'",
      "Store a payload in support messages (stored XSS)",
      "Abuse the open redirect and the CORS reflection",
    ],
    site: ({ onReveal }) => <CyberBank onReveal={onReveal} />,
    supplyChain: false,
    impact:
      "Full account takeover and unauthorized transfers inside a banking application.",
    cves: [
      { id: "CVE-2021-22986", name: "F5 iControl REST Auth Bypass", score: "9.8", year: "2021", desc: "Authentication bypass via forged request — the same 'trust the client' mistake as an unsigned session cookie." },
      { id: "CVE-2017-1000028", name: "WordPress Ultimate Addons CSRF", score: "6.1", year: "2017", desc: "State-changing requests without CSRF protection, so a logged-in victim can be forced into actions." },
      { id: "CVE-2023-33706", name: "SysAid IDOR on Ticket Data", score: "6.5", year: "2023", desc: "Object enumeration via modified identifiers — reading records that aren't yours." },
    ],
    cvss: { vector: "AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H", score: 8.8, severity: "High" },
    practices: [
      "Never store trust data in cookies — use server-side sessions with random ids",
      "Sign and encrypt any cookie, and set HttpOnly + Secure + SameSite",
      "Add anti-CSRF tokens to every state-changing request",
      "Authorize each object on the server, never trust ids from the client",
      "Use unpredictable identifiers (UUIDs) for accounts and statements",
      "Escape all output — stored content must never render as HTML",
      "Allowlist redirect destinations and CORS origins",
      "Detect and alert on parameter-enumeration patterns",
    ],
    apps: [
      {
        id: "bank-statement",
        name: "Statement IDOR",
        category: "IDOR · OWASP #1",
        filter: "access",
        difficulty: "easy",
        goal: "Open account #1003 from the Statements page and read Marcus Reed's statement.",
        flag: "FLAG{acc0unt_3num}",
        hint: "Statements load by sequential account number — try ?account=1003 in the URL bar.",
        learn:
          "Sequential ids + no ownership check = any customer reads every account. Fix: object-level authorization and UUIDs.",
        cve: { id: "CVE-2023-33706", name: "SysAid IDOR", score: "6.5", desc: "Reading arbitrary records via a modified identifier." },
      },
      {
        id: "bank-cookie",
        name: "Session Cookie Forgery",
        category: "Broken Authentication / Session · OWASP #7",
        filter: "access",
        difficulty: "medium",
        goal: "Open the Security page, forge the session cookie to role=admin, and save it to unlock the Admin Console.",
        flag: "FLAG{c00k13_f0rg3ry}",
        hint: "The cookie is base64 JSON with no signature — change role to admin and save.",
        learn:
          "Unsigned, client-stored sessions are forgeable — anyone can mint an admin. Fix: server-side sessions, signed cookies, HttpOnly/Secure/SameSite.",
        cve: { id: "CVE-2021-22986", name: "F5 iControl REST Auth Bypass", score: "9.8", desc: "Authentication bypass by abusing trust in client-supplied data." },
      },
      {
        id: "bank-csrf",
        name: "CSRF Forged Transfer",
        category: "CSRF · OWASP #1",
        filter: "access",
        difficulty: "medium",
        goal: "On the Transfers page, open the unread rewards email and render its images to trigger an unauthorized transfer.",
        flag: "FLAG{csrf_n0_t0k3n}",
        hint: "Transfers are 'locked' — until an email image makes the request with your cookies.",
        learn:
          "No CSRF token means any site can make a logged-in browser act. Fix: per-session tokens, SameSite cookies, and confirmations on money movement.",
        cve: { id: "CVE-2017-1000028", name: "WordPress Ultimate Addons CSRF", score: "6.1", desc: "State changes without anti-CSRF protection." },
      },
      {
        id: "bank-xss",
        name: "Stored XSS in Support Messages",
        category: "Stored XSS · OWASP #3",
        filter: "injection",
        difficulty: "easy",
        goal: "Reply to the support thread with a script tag and watch it execute for staff.",
        flag: "FLAG{bank_st0r3d_xss}",
        hint: "Messages are stored and shown to staff as raw HTML.",
        learn:
          "Stored XSS in a financial context lets attacker scripts ride the support session. Fix: escape all output, use a safe renderer, and set a strict CSP.",
        cve: { id: "CVE-2020-35846", name: "Cockpit CMS Stored XSS", score: "6.1", desc: "User content rendered unescaped for other users." },
      },
      {
        id: "bank-redirect",
        name: "Open Redirect",
        category: "Open Redirect · OWASP #1",
        filter: "access",
        difficulty: "easy",
        goal: "On the Dashboard's sponsored offer, point the destination at an external site and confirm the redirect.",
        flag: "FLAG{bank_0p3n_r3d1r}",
        hint: "The destination comes from the next parameter — set it to https://evil.example.com",
        learn:
          "A trusted next parameter lets attackers build phishing links that look like the bank. Fix: allowlist internal destinations and reject external URLs.",
        cve: { id: "CVE-2019-18810", name: "Open Redirect in Auth Flows", score: "4.3", desc: "Trusted redirect parameters forwarded to attacker-controlled destinations." },
      },
      {
        id: "bank-cors",
        name: "CORS Misconfiguration",
        category: "CORS Misconfiguration · OWASP #5",
        filter: "access",
        difficulty: "medium",
        goal: "In the Developer API console, set an attacker origin and fetch the balance response.",
        flag: "FLAG{bank_c0rs_bug}",
        hint: "The API reflects any Origin with credentials — try https://evil.example.com",
        learn:
          "Reflecting every Origin with credentials hands authenticated responses to any page on the internet. Fix: allowlist exact origins and never reflect user-supplied ones.",
        cve: { id: "CVE-2021-22986", name: "CORS Origin Reflection", score: "7.5", desc: "Server reflects arbitrary origins with credentials, leaking authenticated responses." },
      },
    ],
  },
  {
    id: "health",
    name: "CareNow Clinic Portal",
    emoji: "🏥",
    theme: "Healthcare",
    difficulty: "Easy",
    story:
      "The clinic locks the front door but leaves every exam room unlocked. One patient portal — records, appointments and a welcome banner — and protected health information is a URL edit away.",
    chain: [
      "Change the record id in the URL",
      "Read another patient's records",
      "Stored XSS in appointment notes",
      "DOM XSS in the welcome banner fragment",
    ],
    site: ({ onReveal }) => <CareNow onReveal={onReveal} />,
    supplyChain: false,
    impact:
      "Protected health information leaks, and attacker scripts run inside staff browsers.",
    cves: [
      { id: "CVE-2023-33706", name: "SysAid IDOR on Ticket Data", score: "6.5", year: "2023", desc: "Reading arbitrary records via a modified identifier — the record-viewing bug." },
      { id: "CVE-2020-35846", name: "Cockpit CMS Stored XSS", score: "6.1", year: "2020", desc: "Stored cross-site scripting in user content rendered for other users." },
    ],
    cvss: { vector: "AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N", score: 6.5, severity: "High" },
    practices: [
      "Authorize every record access on the server",
      "Use UUIDs for medical record ids",
      "Encode all output and sanitize rich text",
      "Never write URL fragments into the DOM with innerHTML",
      "Encrypt protected health information at rest",
      "Role-based access control for clinical staff",
      "Audit every record read and write",
    ],
    apps: [
      {
        id: "health-records",
        name: "Patient Records",
        category: "IDOR · OWASP #1",
        filter: "access",
        difficulty: "easy",
        goal: "Records load by sequential id. Change the URL to read another patient's file.",
        flag: "FLAG{p4t13nt_0v3rl00k}",
        hint: "Your record is 2001. Try 2002.",
        learn:
          "Sequential record ids with no ownership check expose sensitive health data. Fix: object-level authorization and unpredictable ids.",
        cve: { id: "CVE-2023-33706", name: "SysAid IDOR", score: "6.5", desc: "Reading arbitrary records via a modified identifier." },
      },
      {
        id: "health-xss",
        name: "Appointment Notes",
        category: "Stored XSS · OWASP #3",
        filter: "injection",
        difficulty: "easy",
        goal: "Appointment notes render as raw HTML for staff. Plant a script that executes in the doctor's browser.",
        flag: "FLAG{xss1n_cl1n1c}",
        hint: "Book an appointment and put <script>alert(1)</script> in the note.",
        learn:
          "Stored XSS in a clinical context is severe — attacker scripts can read patient data in the doctor's session. Fix: escape output, use a safe renderer, CSP.",
        cve: { id: "CVE-2020-35846", name: "Cockpit CMS Stored XSS", score: "6.1", desc: "User content rendered unescaped for other users." },
      },
      {
        id: "health-dom",
        name: "Welcome Banner",
        category: "DOM XSS · OWASP #3",
        filter: "injection",
        difficulty: "easy",
        goal: "The portal reads the URL fragment and writes it into the page with innerHTML. Inject a payload that executes in the browser.",
        flag: "FLAG{d0m_xss_p0rtal}",
        hint: "Trigger a fragment like <img src=x onerror=alert(1)> — the server never even sees it.",
        learn:
          "DOM XSS: the value comes from the URL fragment and is written with innerHTML entirely in the browser — server-side filters never see it. Fix: use textContent, encode context, and set a strict CSP.",
        cve: { id: "CVE-2020-35846", name: "DOM-Based Cross-Site Scripting", score: "6.1", desc: "Client-side only XSS from unsafe DOM sinks." },
      },
    ],
  },
  {
    id: "owasp",
    name: "OWASP Corp · Top 10",
    emoji: "🛡️",
    theme: "OWASP Top 10 (2021)",
    difficulty: "Easy → Medium",
    story:
      "A clean, professional corporate portal with one vulnerability hiding in every module — one per OWASP Top 10 2021 category, from Broken Access Control to SSRF. Every page behaves like a real production app: no checklists, no task queue. Confirm all ten findings and walk away knowing the entire Top 10 by touch.",
    chain: [
      "Recon the portal — every module maps to one OWASP category",
      "Work the pages like a pentester: directory, payroll, search",
      "Move through identity and system tools: session, debug, updates",
      "Confirm each finding against its OWASP category",
      "Map every finding to a real CVE in the post-breach report",
    ],
    site: ({ onReveal }) => <OwaspPortal onReveal={onReveal} />,
    supplyChain: false,
    impact:
      "Hands-on command of all ten OWASP Top 10 (2021) risk categories, each mapped to a real CVE.",
    cves: [
      { id: "CVE-2021-44228", name: "Apache Log4j2 'Log4Shell'", score: "10.0", year: "2021", desc: "Remote code execution in an outdated logging library — the A06 vulnerable-components star." },
      { id: "CVE-2023-25157", name: "GeoServer OGC Filter SQL Injection", score: "9.8", year: "2023", desc: "Unauthenticated SQL injection — the classic A03 injection class." },
      { id: "CVE-2021-22005", name: "VMware vCenter SSRF", score: "9.8", year: "2021", desc: "Server-side request forgery into internal services — A10." },
      { id: "CVE-2020-5902", name: "F5 BIG-IP Authentication Bypass", score: "9.8", year: "2020", desc: "Authentication bypass from trusting client-supplied identity — A07." },
    ],
    cvss: { vector: "AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H", score: 8.8, severity: "High" },
    practices: [
      "Enforce object-level authorization on every request",
      "Never store secrets, passwords, or card numbers in plaintext",
      "Parameterize every database query",
      "Design flows that fail closed and resist abuse (rate limits, unpredictable tokens)",
      "Remove debug consoles and default credentials from production",
      "Patch and inventory every third-party component",
      "Verify signatures and checksums on every update",
      "Log, monitor, and alert on failed authentication and sensitive actions",
      "Block server-side fetches to internal addresses (SSRF)",
    ],
    apps: [
      {
        id: "owasp-acl",
        name: "Customer Directory",
        category: "A01 · Broken Access Control",
        filter: "access",
        difficulty: "easy",
        goal: "Customer records load by id in the URL. Read a record that isn't yours.",
        flag: "FLAG{ac1_cust0mer_1d0r}",
        hint: "Your record is 101. Try 102.",
        learn:
          "A01 Broken Access Control: the server checks you're signed in but never that the record belongs to you. Object-level authorization on every request is the fix, plus unpredictable ids.",
        cve: { id: "CVE-2024-32166", name: "Webid IDOR / Broken Access Control", score: "6.5", desc: "Acting on another user's object without an ownership check." },
      },
      {
        id: "owasp-crypto",
        name: "Payroll Records",
        category: "A02 · Cryptographic Failures",
        filter: "integrity",
        difficulty: "easy",
        goal: "Sensitive data is protected only by encoding, not encryption or hashing. Show the plaintext.",
        flag: "FLAG{w34k_crypt0_p4y}",
        hint: "The password blobs are base64 — decode them (DevTools box does it for you).",
        learn:
          "A02 Cryptographic Failures: base64 is encoding, not protection, and storing card numbers in plaintext is a breach waiting to happen. Fix: strong adaptive hashes with per-row salts, field-level encryption, and never log secrets.",
        cve: { id: "CVE-2020-0601", name: "Windows CryptoAPI 'CurveBall'", score: "8.8", desc: "Trusting cryptographically broken primitives — the crypto-failure class." },
      },
      {
        id: "owasp-injection",
        name: "Product Search",
        category: "A03 · Injection",
        filter: "injection",
        difficulty: "medium",
        goal: "The search term is pasted into a SQL string. Leak the users table.",
        flag: "FLAG{1nj3ct10n_5ql}",
        hint: "' UNION SELECT username, password FROM users--",
        learn:
          "A03 Injection: string concatenation turns user input into SQL. UNION SELECT merges a second query into the result set. Fix: prepared statements, least-privilege DB accounts, and encoded output.",
        cve: { id: "CVE-2023-25157", name: "GeoServer OGC Filter SQL Injection", score: "9.8", desc: "Unauthenticated SQL injection via crafted filter values." },
      },
      {
        id: "owasp-design",
        name: "Password Reset",
        category: "A04 · Insecure Design",
        filter: "access",
        difficulty: "easy",
        goal: "The reset flow leaks whether an account exists and builds a guessable token. Exploit both.",
        flag: "FLAG{1ns3cur3_d3s1gn}",
        hint: "Try admin@owasp-corp.com vs a made-up address — and look at what the reset token is.",
        learn:
          "A04 Insecure Design: user enumeration via different responses, no rate limiting, and tokens derived from the username are design flaws — no code patch fixes them. Fix: uniform responses, unpredictable tokens, rate limits, and abuse-case modeling.",
        cve: { id: "CVE-2023-38646", name: "Metabase Pre-Auth RCE (Setup Token)", score: "9.8", desc: "A predictable, hardcoded setup token — insecure design by default." },
      },
      {
        id: "owasp-misconfig",
        name: "Debug Console",
        category: "A05 · Security Misconfiguration",
        filter: "access",
        difficulty: "easy",
        goal: "A production debug endpoint ships with default credentials and verbose errors. Get in.",
        flag: "FLAG{d3f4ult_cr3ds_1n}",
        hint: "Defaults are defaults — admin/admin.",
        learn:
          "A05 Security Misconfiguration: debug consoles left in production, default credentials, and stack traces that leak internals. Fix: disable debug endpoints, force credential changes, suppress verbose errors, and scan configs in CI.",
        cve: { id: "CVE-2023-0669", name: "GoAnywhere MFT Default Credentials", score: "7.2", desc: "Shipping with default admin credentials in production." },
      },
      {
        id: "owasp-components",
        name: "Software Inventory",
        category: "A06 · Vulnerable & Outdated Components",
        filter: "integrity",
        difficulty: "medium",
        goal: "An end-of-life library processes your input unsafely. Trigger the known flaw.",
        flag: "FLAG{outd4t3d_l0g4j}",
        hint: "The scanner logs lookups through Log4j 2.14.1. Feed it a JNDI payload.",
        learn:
          "A06 Vulnerable & Outdated Components: Log4j 2.14.1 evaluates ${jndi:...} lookups, enabling remote code execution — patched years ago in 2.17. Fix: maintain an SBOM, patch within SLA, and remove EOL components.",
        cve: { id: "CVE-2021-44228", name: "Apache Log4j2 'Log4Shell'", score: "10.0", desc: "JNDI lookups in an outdated logging library — RCE from a single log message." },
      },
      {
        id: "owasp-auth",
        name: "Session Manager",
        category: "A07 · Identification & Authentication Failures",
        filter: "access",
        difficulty: "medium",
        goal: "The session cookie is a predictable plaintext pair with no expiry. Forge an admin session.",
        flag: "FLAG{pr3d1ct4bl3_s3ss10n}",
        hint: "The token is username:counter. Edit the session cookie in the jar to admin:1.",
        learn:
          "A07 Identification & Authentication Failures: a guessable, non-expiring session cookie lets anyone impersonate any user. Fix: random high-entropy session ids, server-side validation, expiry, rotation, and MFA on privileged accounts.",
        cve: { id: "CVE-2020-5902", name: "F5 BIG-IP Authentication Bypass", score: "9.8", desc: "Trusting attacker-supplied identity to bypass authentication." },
      },
      {
        id: "owasp-integrity",
        name: "Update Center",
        category: "A08 · Software & Data Integrity Failures",
        filter: "integrity",
        difficulty: "medium",
        goal: "Releases install with no signature or checksum check. Install the untrusted update.",
        flag: "FLAG{unv3r1f1ed_upd4t3}",
        hint: "The manifest shows 'signature: not verified'. Install it anyway.",
        learn:
          "A08 Software & Data Integrity Failures: installing unsigned updates means you can't tell a vendor release from an attacker's payload. Fix: verify signatures and hashes, pin trust anchors, and sign all code and pipelines.",
        cve: { id: "CVE-2017-3506", name: "Oracle WebLogic Deserialization", score: "9.8", desc: "Trusting attacker-supplied serialized data — an integrity failure." },
      },
      {
        id: "owasp-logging",
        name: "Security Center",
        category: "A09 · Security Logging & Monitoring Failures",
        filter: "integrity",
        difficulty: "medium",
        goal: "Prove the platform can't see an attack: run the detection self-test.",
        flag: "FLAG{n0_l0gg1ng_m0n1t0r1ng}",
        hint: "Run the self-test and read what the audit log and SIEM captured (0 events).",
        learn:
          "A09 Security Logging & Monitoring Failures: without logging, alerting, and retention, active compromise runs unnoticed for months. Fix: log auth failures and sensitive actions, forward to a SIEM, alert on anomalies, and test detection.",
        cve: { id: "CVE-2020-10148", name: "SolarWinds Orion (Poor Detection)", score: "9.8", desc: "Months of active compromise went unnoticed — the A09 blind-spot class." },
      },
      {
        id: "owasp-ssrf",
        name: "URL Proxy",
        category: "A10 · Server-Side Request Forgery",
        filter: "ssrf",
        difficulty: "medium",
        goal: "The proxy fetches URLs server-side. Reach an internal-only address.",
        flag: "FLAG{5srf_1nt3rn4l_4cc}",
        hint: "Fetch http://127.0.0.1/ — the response is internal.",
        learn:
          "A10 SSRF: a server-side fetch of user input becomes a gateway to internal services and cloud metadata. Fix: allowlist destinations, block loopback/private ranges, and route fetches through an egress proxy.",
        cve: { id: "CVE-2021-22005", name: "VMware vCenter SSRF", score: "9.8", desc: "SSRF into internal services enabling code execution." },
      },
    ],
  },
  {
    id: "tea",
    name: "Cyber Tea House",
    emoji: "🐺",
    theme: "Tea Shop Management · 10 Labs + Attack Chain",
    difficulty: "Easy → Medium",
    story:
      "You are the security analyst hired to save a local tea shop. Its POS system runs the whole business — orders, customers, inventory, payroll and the owner's admin dashboard — and every module hides a vulnerability. Ten labs, each inside a real workflow, and the main feature: a graph-based attack chain that shows how each flaw connects to the next until the entire shop is compromised.",
    chain: [
      "Info leak in the debug console",
      "Weak admin password gets you in",
      "IDOR reveals another customer's invoice",
      "SQLi dumps the customer database",
      "Cashier reaches the admin panel",
      "Session cookie exposes sensitive data",
      "CRITICAL — the full chain is yours",
    ],
    site: ({ onReveal }) => <TeaShop onReveal={onReveal} />,
    supplyChain: false,
    impact:
      "A business-realistic POS where every OWASP Top 10 class appears in a believable workflow, chained together end to end.",
    cves: [
      { id: "CVE-2023-25157", name: "GeoServer OGC Filter SQL Injection", score: "9.8", year: "2023", desc: "Unauthenticated SQL injection via crafted filter values — the customer-search lab." },
      { id: "CVE-2024-32166", name: "Webid IDOR / Broken Access Control", score: "6.5", year: "2024", desc: "Acting on another user's object — the invoice and admin-panel labs." },
      { id: "CVE-2021-44228", name: "Apache Log4j2 'Log4Shell'", score: "10.0", year: "2021", desc: "Unsafe handling of untrusted input inside a component — the file-upload class." },
      { id: "CVE-2021-22005", name: "VMware vCenter SSRF", score: "9.8", year: "2021", desc: "Server-side request forgery — the supplier URL import lab." },
    ],
    cvss: { vector: "AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H", score: 8.8, severity: "High" },
    practices: [
      "Parameterize every database query",
      "Enforce server-side authorization on every route",
      "Require MFA and lockout on privileged accounts",
      "Validate and encode all input and output",
      "Add CSRF tokens to state-changing forms",
      "Whitelist file types and verify content on upload",
      "Never expose debug consoles, keys, or versions in production",
      "Set Secure, HttpOnly and SameSite on session cookies",
      "Block server-side fetches to internal addresses",
    ],
    apps: [
      {
        id: "tea-sqli",
        name: "Lab 1 · SQL Injection",
        category: "A03 Injection · Customer Search",
        filter: "injection",
        difficulty: "easy",
        goal: "The customer search pastes your name into a SQL string. Dump the whole customer table.",
        flag: "FLAG{5ql1_cu5t0m3r_dump}",
        hint: "Close the quote and OR something always true, or use UNION.",
        learn:
          "SQL injection: string concatenation turns user input into SQL. OR '1'='1 (or a UNION) returns every row. Fix: prepared statements and least-privilege DB accounts.",
        cve: { id: "CVE-2023-25157", name: "GeoServer OGC Filter SQL Injection", score: "9.8", desc: "SQL injection via crafted filter values." },
      },
      {
        id: "tea-idor",
        name: "Lab 2 · IDOR",
        category: "A01 Broken Access Control · Invoices",
        filter: "access",
        difficulty: "easy",
        goal: "Invoices load by id in the URL. Read a customer's invoice that isn't yours.",
        flag: "FLAG{1d0r_1nv01c3_1002}",
        hint: "Yours is 1001. Try 1002.",
        learn:
          "IDOR: the app checks you're signed in but never that the invoice belongs to you. Sequential ids make every record one guess away. Fix: object-level authorization and unpredictable ids.",
        cve: { id: "CVE-2024-32166", name: "Webid IDOR / Broken Access Control", score: "6.5", desc: "Acting on another user's object without an ownership check." },
      },
      {
        id: "tea-auth",
        name: "Lab 3 · Weak Authentication",
        category: "A07 Auth Failures · Login",
        filter: "access",
        difficulty: "easy",
        goal: "Default credentials with no lockout or MFA. Log in as the owner.",
        flag: "FLAG{w34k_4dm1n_p455}",
        hint: "The installer ships with the most famous password of all.",
        learn:
          "Weak authentication: default credentials, no lockout and no MFA make brute force trivial. Fix: password policy, MFA for admins, account lockout, and forced first-login password changes.",
        cve: { id: "CVE-2020-5902", name: "F5 BIG-IP Authentication Bypass", score: "9.8", desc: "Trusting trivial or default credentials to grant privileged access." },
      },
      {
        id: "tea-xss",
        name: "Lab 4 · XSS",
        category: "A03 Injection · Feedback",
        filter: "injection",
        difficulty: "easy",
        goal: "Feedback renders as raw HTML for the owner. Plant a script that runs in their browser.",
        flag: "FLAG{x55_f33db4ck}",
        hint: "Put <script>alert(1)</script> (or an img onerror) in the feedback.",
        learn:
          "Stored XSS: unescaped output turns a comment into code that runs in the owner's session. Fix: escape all output and use a safe rendering engine with a strict CSP.",
        cve: { id: "CVE-2020-35846", name: "Cockpit CMS Stored XSS", score: "6.1", desc: "User content rendered unescaped for other users." },
      },
      {
        id: "tea-csrf",
        name: "Lab 5 · CSRF",
        category: "A01 Broken Access Control · Password Change",
        filter: "integrity",
        difficulty: "medium",
        goal: "The password change carries no CSRF token. A forged request can change it.",
        flag: "FLAG{csrf_n0_t0k3n}",
        hint: "Submit a password change and read what the request included.",
        learn:
          "CSRF: a state-changing form with no token lets any page you visit submit it on your behalf. Fix: per-session CSRF tokens (or SameSite cookies) on every state-changing request.",
        cve: { id: "CVE-2021-22986", name: "CORS / CSRF Misconfiguration Class", score: "9.1", desc: "Trusting cross-site requests without verification." },
      },
      {
        id: "tea-upload",
        name: "Lab 6 · File Upload",
        category: "A03 Injection · Employee Photo",
        filter: "injection",
        difficulty: "medium",
        goal: "The photo upload accepts any filename. Upload an executable script.",
        flag: "FLAG{up10ad_3xt_ch3ck}",
        hint: "Try a filename ending in .php or .sh.",
        learn:
          "File upload: no extension or content validation means a script in a web-accessible folder becomes remote code execution. Fix: whitelist MIME types, verify magic bytes, randomize filenames, store outside the web root.",
        cve: { id: "CVE-2022-24112", name: "Apache APISIX Upload RCE", score: "9.8", desc: "Unrestricted file upload leading to remote code execution." },
      },
      {
        id: "tea-info",
        name: "Lab 7 · Information Disclosure",
        category: "A05 Misconfiguration · Debug Console",
        filter: "integrity",
        difficulty: "easy",
        goal: "The production debug console leaks internals. Open the stack trace.",
        flag: "FLAG{d3bug_l34k5}",
        hint: "Expand the debug mode panel on the admin page.",
        learn:
          "Information disclosure: debug consoles, stack traces, versions and keys in production hand attackers a map. Fix: disable debug endpoints, rotate leaked keys, and suppress verbose errors.",
        cve: { id: "CVE-2023-0669", name: "GoAnywhere MFT Default Configuration", score: "7.2", desc: "Production systems exposing internal configuration details." },
      },
      {
        id: "tea-session",
        name: "Lab 8 · Session Hijacking",
        category: "A07 Auth Failures · Cookie Flags",
        filter: "access",
        difficulty: "medium",
        goal: "The session cookie lacks Secure, HttpOnly and SameSite. Show it being stolen.",
        flag: "FLAG{s3ss10n_c00k13}",
        hint: "Inspect the session configuration on the Settings page.",
        learn:
          "Session security: a cookie without HttpOnly is readable by scripts, without Secure it travels over HTTP, without SameSite it's sent cross-site. Fix: set all three flags, use a random high-entropy session id, and rotate on privilege change.",
        cve: { id: "CVE-2020-5902", name: "F5 BIG-IP Authentication Bypass", score: "9.8", desc: "Session/identity compromise from weak cookie handling." },
      },
      {
        id: "tea-access",
        name: "Lab 9 · Broken Access Control",
        category: "A01 Broken Access Control · Admin Panel",
        filter: "access",
        difficulty: "easy",
        goal: "Only the UI hides the admin panel from the cashier. Open it anyway.",
        flag: "FLAG{c4sh13r_4dm1n}",
        hint: "The cashier can still navigate to /admin directly.",
        learn:
          "Broken access control: authorization that lives in the menu, not the server, is decoration. Fix: enforce role checks on every privileged route server-side.",
        cve: { id: "CVE-2024-32166", name: "Webid IDOR / Broken Access Control", score: "6.5", desc: "Privileged resource reachable without authorization." },
      },
      {
        id: "tea-ssrf",
        name: "Lab 10 · SSRF",
        category: "A10 SSRF · Supplier Import",
        filter: "ssrf",
        difficulty: "medium",
        goal: "The supplier import fetches URLs server-side. Reach an internal endpoint.",
        flag: "FLAG{55rf_5uppl13r}",
        hint: "Fetch http://127.0.0.1/internal.",
        learn:
          "SSRF: a server-side fetch of user input becomes a tunnel to internal services. Fix: allowlist destinations, block loopback/private ranges, and route fetches through an egress proxy.",
        cve: { id: "CVE-2021-22005", name: "VMware vCenter SSRF", score: "9.8", desc: "SSRF into internal services enabling code execution." },
      },
      {
        id: "tea-chain",
        name: "Attack Chain · Full Compromise",
        category: "Chain · Graph-Based Exploitation",
        filter: "integrity",
        difficulty: "hard",
        goal: "Confirm every link of the attack chain — info leak → weak password → login → IDOR → customer DB → admin panel → data exposure — to reach CRITICAL.",
        flag: "FLAG{ch41n_r34ct3d_th3_5h0p}",
        hint: "The chain graph on the Attack Chain tab shows which links are missing.",
        learn:
          "Real attacks are chains: one low-severity finding (an info leak) compounds into full compromise. This is why defense-in-depth matters — fixing any single link breaks the whole chain. Fix all of them.",
        cve: { id: "CVE-2021-44228", name: "Chained Exploitation (Log4Shell → Post-Exploitation)", score: "10.0", desc: "Real-world intrusions chain multiple weaknesses into full compromise." },
      },
    ],
  },
];

export function findPlayground(id) {
  return playgrounds.find((p) => p.id === id);
}
