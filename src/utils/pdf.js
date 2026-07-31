import { jsPDF } from "jspdf";

const VIOLET = [123, 63, 242];
const DEEP = [18, 4, 61];
const INK = [40, 30, 70];
const MUTED = [110, 102, 140];
const PAGE_H = 297;
const MARGIN = 20;
const MAX_Y = PAGE_H - MARGIN;

function drawHeader(doc) {
  doc.setFillColor(...DEEP);
  doc.rect(0, 0, 210, 20, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text("Cyber Wolf Chain — Learning Guide", 15, 13);
}

function freshPage(doc) {
  doc.addPage();
  drawHeader(doc);
  return 24;
}

function textAt(doc, x, y, text, opts = {}) {
  const { bold = false, size = 9.5, color = INK } = opts;
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.text(text, x, y);
}

function para(doc, y, text, width, opts = {}) {
  const { size = 9.5, bold = false, color = INK, lineHeight = 4.5 } = opts;
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, width);
  for (const line of lines) {
    if (y > MAX_Y - 8) y = freshPage(doc);
    doc.text(line, 20, y);
    y += lineHeight;
  }
  return y;
}

function sectionTitle(doc, y, text) {
  doc.setFillColor(...VIOLET);
  doc.rect(15, y - 4.5, 3, 6, "F");
  textAt(doc, 20, y, text, { bold: true, size: 13, color: DEEP });
  return y + 7;
}

function addPageNumbers(doc) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Cyber Wolf Chain · Confidential — learning simulation only`, 15, 290);
    doc.text(`Page ${i} of ${total}`, 195, 290, { align: "right" });
  }
}

function metaLine(doc, x, y, label, value) {
  textAt(doc, x, y, label, { bold: true, size: 8.5, color: MUTED });
  textAt(doc, x + 32, y, value, { size: 8.5 });
}

export function generateLearningGuide(rooms) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  drawHeader(doc);
  let y = 24;

  textAt(doc, 15, 32, "Cyber Wolf Chain", { bold: true, size: 22, color: DEEP });
  textAt(doc, 15, 38, "Attack-Chain CTF Labs — Learn by breaking the chain.", {
    size: 11,
    color: MUTED,
  });

  y = 46;
  y = sectionTitle(doc, y, "How this project teaches security");
  y = para(
    doc,
    y,
    "Cyber Wolf Chain is a hands-on, browser-based CTF platform. Every room is one complete attack chain — recon, exploit, escalate, impact — the way real attackers think. You hunt flags inside a simulated vulnerable web app with a real, editable URL bar, then lock in a score, earn badges and download your report.",
    175
  );
  y += 2;

  rooms.forEach((room, ri) => {
    if (y > MAX_Y - 40) y = freshPage(doc);
    y = sectionTitle(doc, y + 2, `${ri + 1}. ${room.title}`);
    y = para(doc, y, room.story, 175);
    y += 1;

    textAt(
      doc,
      20,
      y,
      `${room.owasp.code} ${room.owasp.name} (#${room.owasp.rank})  ·  CWE-${room.cwe}  ·  CVSS ${room.cvss.score} ${room.cvss.severity}  ·  Chain: ${room.chainTitle}`,
      { bold: true, color: VIOLET }
    );
    y += 5.5;

    room.steps.forEach((step) => {
      if (y > MAX_Y - 16) y = freshPage(doc);
      textAt(doc, 20, y, `Step: ${step.title}`, { bold: true, color: DEEP });
      y += 4.8;
      y = para(doc, y, step.objective, 150, { lineHeight: 4.2 });
      if (step.answers && step.answers.length) {
        y = para(doc, y, `Answer / flag: ${step.answers[0]}`, 150, {
          lineHeight: 4.2,
        });
      }
      y += 1.5;
    });

    y = sectionTitle(doc, y + 2, "How to fix it");
    room.prevention.checklist.forEach((item) => {
      y = para(doc, y, `• ${item}`, 170, { lineHeight: 4.2 });
    });
    y += 1;

    y = sectionTitle(doc, y + 2, "Real-world CVEs");
    room.cves.forEach((cve) => {
      if (y > MAX_Y - 12) y = freshPage(doc);
      textAt(doc, 20, y, `${cve.id} — ${cve.name} (${cve.score})`, {
        bold: true,
      });
      y += 4.8;
      y = para(doc, y, cve.desc, 168, { lineHeight: 4.2 });
      y += 1;
    });
    y += 3;
  });

  if (y > MAX_Y - 20) y = freshPage(doc);
  doc.setDrawColor(...VIOLET);
  doc.line(15, y, 195, y);
  y += 8;
  textAt(doc, 15, y, "Start your hunt", { bold: true, size: 11, color: DEEP });
  y += 5.5;
  y = para(
    doc,
    y,
    "Open a room, edit the URL bar in the simulated app, find the flag and break the chain. Full writeups ship with every room in Markdown — read them to go deeper.",
    180
  );

  doc.save("cyber-wolf-chain-learning-guide.pdf");
}

export function generateHuntReport(playground, user) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  drawHeader(doc);
  let y = 24;

  const today = new Date().toISOString().slice(0, 10);
  const analyst = user ? `${user.username} (${user.id})` : "Guest explorer";

  textAt(doc, 15, 32, `${playground.emoji} ${playground.name}`, {
    bold: true,
    size: 20,
    color: DEEP,
  });
  textAt(doc, 15, 38, "Penetration Test — Post-Breach Analysis Report", {
    size: 10.5,
    color: MUTED,
  });

  doc.setFillColor(255, 244, 214);
  doc.setTextColor(122, 80, 3);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("CONFIDENTIAL — LEARNING SIMULATION ONLY", 195, 33, {
    align: "right",
  });
  doc.text("DO NOT TEST AGAINST LIVE SYSTEMS", 195, 38, { align: "right" });

  y = 46;
  metaLine(doc, 15, y, "Prepared by:", analyst);
  y += 5;
  metaLine(doc, 15, y, "Date:", today);
  y += 5;
  metaLine(doc, 15, y, "Report ID:", `CWC-${playground.id.toUpperCase()}-${today.replace(/-/g, "")}`);
  y += 5;
  metaLine(doc, 15, y, "Classification:", "Confidential · Internal use");
  y += 5;
  metaLine(doc, 15, y, "Scope:", playground.theme);
  y += 8;

  y = sectionTitle(doc, y, "Executive summary");
  y = para(
    doc,
    y,
    `This report documents a full compromise of the ${playground.name} environment in a controlled, browser-based sandbox. ${playground.apps.length} distinct vulnerabilities were chained to move from initial foothold to high-impact access: ${playground.apps.map((a) => a.name).join(", ")}. Overall severity is ${playground.cvss.severity.toLowerCase()} (CVSS ${playground.cvss.score}/10). If reproduced against a live system, the business impact would be ${playground.impact}.`,
    175
  );
  y += 2;

  y = sectionTitle(doc, y, "Attack narrative");
  y = para(doc, y, playground.story, 175);

  if (playground.supplyChainNote) {
    y += 1;
    y = para(doc, y, `Supply chain angle: ${playground.supplyChainNote}`, 175, {
      color: VIOLET,
    });
  }
  y += 1;

  y = sectionTitle(doc, y, "Chain of compromise");
  playground.chain.forEach((step, i) => {
    if (y > MAX_Y - 16) y = freshPage(doc);
    textAt(doc, 20, y, `${String(i + 1).padStart(2, "0")}. ${step}`, {
      bold: true,
      color: DEEP,
    });
    y += 5;
  });
  y += 1;

  y = sectionTitle(doc, y, "Findings");
  playground.apps.forEach((app, i) => {
    if (y > MAX_Y - 34) y = freshPage(doc);
    const parts = app.learn.split(/Fix:\s*/i);
    const how = parts[0].trim();
    const fix = parts.length > 1 ? parts.slice(1).join("Fix: ").trim() : null;

    doc.setFillColor(255, 245, 240);
    doc.roundedRect(15, y - 4, 180, 4, 0.8, 0.8, "F");
    textAt(
      doc,
      20,
      y,
      `Finding ${String(i + 1).padStart(2, "0")} — ${app.name} · ${app.category} · Difficulty: ${app.difficulty}`,
      { bold: true, size: 10, color: DEEP }
    );
    y += 6.5;

    textAt(doc, 20, y, "How it works:", { bold: true, size: 9, color: VIOLET });
    y += 4.6;
    y = para(doc, y, how, 168, { lineHeight: 4.2 });
    if (fix) {
      y += 0.6;
      textAt(doc, 20, y, "How to prevent:", { bold: true, size: 9, color: VIOLET });
      y += 4.6;
      y = para(doc, y, fix, 168, { lineHeight: 4.2 });
    }
    if (app.cve) {
      y += 0.6;
      y = para(
        doc,
        y,
        `Related CVE: ${app.cve.id} — ${app.cve.name} (${app.cve.score}/10)`,
        168,
        { lineHeight: 4.2, color: MUTED, size: 8.5 }
      );
    }
    y += 2.5;
  });
  y += 1;

  y = sectionTitle(doc, y, "CVSS assessment");
  textAt(
    doc,
    20,
    y,
    `${playground.cvss.score}/10 ${playground.cvss.severity}  ·  Vector: ${playground.cvss.vector}`,
    { bold: true, color: VIOLET }
  );
  y += 6;
  y = para(
    doc,
    y,
    "CVSS (Common Vulnerability Scoring System) grades how severe a vulnerability is from 0 to 10 using this vector. AV (attack vector) is how the attacker reaches the flaw, AC (complexity) how hard it is to exploit, PR (privileges required) what access is needed, UI (user interaction) whether a victim must click something, C/I/A how much confidentiality, integrity and availability are lost, and S (scope) whether the damage stays inside the one component.",
    175
  );
  y += 2;

  y = sectionTitle(doc, y, "Real-world CVEs behind this world");
  playground.cves.forEach((cve) => {
    if (y > MAX_Y - 18) y = freshPage(doc);
    textAt(doc, 20, y, `${cve.id} — ${cve.name} (${cve.score})`, {
      bold: true,
    });
    y += 4.8;
    y = para(doc, y, cve.desc, 168, { lineHeight: 4.2 });
    y += 1;
  });
  y += 1;

  y = sectionTitle(doc, y, "Remediation checklist");
  playground.practices.forEach((item) => {
    if (y > MAX_Y - 12) y = freshPage(doc);
    y = para(doc, y, `☐ ${item}`, 170, { lineHeight: 4.4 });
  });

  if (y > MAX_Y - 20) y = freshPage(doc);
  doc.setDrawColor(...VIOLET);
  doc.line(15, y, 195, y);
  y += 8;
  textAt(doc, 15, y, "Recommended next steps", {
    bold: true,
    size: 11,
    color: DEEP,
  });
  y += 5.5;
  y = para(
    doc,
    y,
    "1) Apply every item on the remediation checklist to your own code. 2) Move the same class of bug from this sandbox into a real security review of your application. 3) Continue through the rest of the Cyber Wolf Chain worlds — every playground maps to the same real CVEs, so the pattern you learned here transfers everywhere.",
    180
  );

  addPageNumbers(doc);
  doc.save(`cyber-wolf-${playground.id}-analysis.pdf`);
}
