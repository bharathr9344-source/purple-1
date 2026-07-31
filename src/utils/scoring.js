export const BADGES = [
  { id: "first-blood", name: "First Blood", desc: "Complete your first room", icon: "target" },
  { id: "no-hint-pro", name: "No-Hint Pro", desc: "Finish a room without any hints", icon: "brain" },
  { id: "sqli", name: "Injection Hunter", desc: "Crack the SQL Injection chain", icon: "syringe" },
  { id: "idor", name: "Access Control Master", desc: "Crack the IDOR chain", icon: "key" },
  { id: "chain-breaker", name: "Chain Breaker", desc: "See a full chain through to impact", icon: "link" },
  { id: "owasp-scholar", name: "OWASP Scholar", desc: "Complete every room", icon: "trophy" },
];

const POINTS_PER_HINT_PENALTY = 20;
const POINTS_PER_ATTEMPT_PENALTY = 2;
const NO_HINT_BONUS = 25;
const MIN_SCORE = 20;

export function computeRoomScore(room, progress) {
  const r = progress.rooms[room.id];
  if (!r) return 0;

  const totalSteps = room.steps.length;
  const solved = (r.stepsSolved || []).length;
  const hints = Object.values(r.hints || {}).reduce((a, b) => a + b, 0);
  const attempts = Object.values(r.attempts || {}).reduce((a, b) => a + b, 0);

  let score = room.points * (solved / totalSteps);
  score -= hints * POINTS_PER_HINT_PENALTY;
  score -= attempts * POINTS_PER_ATTEMPT_PENALTY;
  if (solved === totalSteps && hints === 0) score += NO_HINT_BONUS;

  return Math.max(MIN_SCORE, Math.round(score));
}

export function roomHints(room, progress) {
  const r = progress.rooms[room.id];
  if (!r) return 0;
  return Object.values(r.hints || {}).reduce((a, b) => a + b, 0);
}

export function roomAttempts(room, progress) {
  const r = progress.rooms[room.id];
  if (!r) return 0;
  return Object.values(r.attempts || {}).reduce((a, b) => a + b, 0);
}

export function roomCompleted(room, progress) {
  const r = progress.rooms[room.id];
  return r?.status === "completed";
}

export function earnedBadges(rooms, progress) {
  const completed = rooms.filter((r) => roomCompleted(r, progress));
  const earned = [];
  const has = (id) => earned.some((b) => b.id === id);

  const add = (b) => {
    if (!has(b.id)) earned.push(b);
  };

  if (completed.length >= 1) add(BADGES[0]);
  if (completed.some((r) => roomHints(r, progress) === 0)) add(BADGES[1]);
  if (completed.some((r) => r.id === "sqli")) add(BADGES[2]);
  if (completed.some((r) => r.id === "idor")) add(BADGES[3]);
  if (completed.length >= 1) add(BADGES[4]);
  if (completed.length === rooms.length) add(BADGES[5]);

  return earned;
}

export function totalPoints(rooms, progress) {
  return rooms.reduce((sum, r) => sum + computeRoomScore(r, progress), 0);
}

export function avgScore(rooms, progress) {
  const completed = rooms.filter((r) => roomCompleted(r, progress));
  if (completed.length === 0) return 0;
  const sum = completed.reduce((acc, r) => acc + computeRoomScore(r, progress), 0);
  return Math.round(sum / completed.length);
}

export function maxPoints(rooms) {
  return rooms.reduce((sum, r) => sum + r.points + NO_HINT_BONUS, 0);
}

export function rankFor(points, rooms) {
  const max = maxPoints(rooms);
  const ratio = points / max;
  if (ratio >= 0.85) return { name: "Chain Master", icon: "crown" };
  if (ratio >= 0.55) return { name: "Hunter", icon: "sword" };
  if (ratio >= 0.25) return { name: "Analyst", icon: "shield" };
  return { name: "Recruit", icon: "seedling" };
}

export function normalizeAnswer(input) {
  return String(input || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function matchesAnswer(input, answers) {
  const value = normalizeAnswer(input);
  return (answers || []).some((a) => normalizeAnswer(a) === value);
}
