import { computeRoomScore } from "./scoring";

export function computeSkills(rooms, progress) {
  return rooms.map((room) => {
    const r = progress.rooms[room.id];
    const score = computeRoomScore(room, progress);
    const max = room.points + 25;
    const pct = Math.min(100, Math.round((score / max) * 100));

    let level = 0;
    if (r?.status === "completed") {
      level = 60 + Math.round((score / max) * 40);
    } else if (r) {
      level = 15 + Math.round((score / max) * 35);
    }

    return {
      roomId: room.id,
      skill: room.category,
      detail: room.title,
      level: Math.min(100, Math.max(0, level)),
      pct,
    };
  });
}

export function skillLabel(level) {
  if (level >= 85) return "Expert";
  if (level >= 60) return "Proficient";
  if (level >= 30) return "Practicing";
  if (level > 0) return "Learning";
  return "Not started";
}

export function formatMemberSince(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
