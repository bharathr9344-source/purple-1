const KEY_PREFIX = "cyberwolf-streak-v1-";

function dayKey(offset) {
  const d = new Date(Date.now() + offset * 86400000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const TODAY = () => dayKey(0);
const YESTERDAY = () => dayKey(-1);

function storageKey(userId) {
  return `${KEY_PREFIX}${userId || "guest"}`;
}

export function loadStreak(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) {
      const p = JSON.parse(raw);
      return {
        streak: Number(p.streak) || 0,
        longest: Number(p.longest) || 0,
        lastActive: p.lastActive || null,
      };
    }
  } catch {
    /* ignore */
  }
  return { streak: 0, longest: 0, lastActive: null };
}

export function updateStreak(userId) {
  const { streak, longest, lastActive } = loadStreak(userId);
  const today = TODAY();

  const next =
    lastActive === today
      ? streak
      : lastActive === YESTERDAY()
        ? streak + 1
        : 1;

  const record = {
    streak: next,
    longest: Math.max(longest, next),
    lastActive: today,
  };
  localStorage.setItem(storageKey(userId), JSON.stringify(record));
  return record;
}
