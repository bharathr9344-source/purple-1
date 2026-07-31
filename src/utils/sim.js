import rooms from "../data/rooms";

const SIM_KEYS = new Set([
  "idor.s1",
  "idor.s2",
  "idor.s3",
  "idor.s4",
  "sqli.s1",
  "sqli.s2",
  "sqli.s3",
  "sqli.s4",
]);

export function hasSim(room, step) {
  return SIM_KEYS.has(`${room.id}.${step.id}`);
}

export const SQLI_LOGIN_ANSWERS = rooms
  .find((r) => r.id === "sqli")
  .steps.find((s) => s.id === "s2").answers;
