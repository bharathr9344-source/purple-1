import { useEffect, useMemo, useState } from "react";

import { AuthContext } from "./auth";
import { updateStreak } from "../utils/streak";

const USERS_KEY = "cyberwolf-users-v1";
const SESSION_KEY = "cyberwolf-session-v1";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
}

function persistUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function randomSegment(n) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: n },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function makeUserId(users) {
  let id;
  do {
    id = `CW-${randomSegment(4)}-${randomSegment(4)}`;
  } while (users[id]);
  return id;
}

function encode(pw) {
  return btoa(unescape(encodeURIComponent(pw)));
}

const zeroStreak = { streak: 0, longest: 0 };

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [userId, setUserId] = useState(() => localStorage.getItem(SESSION_KEY));
  const [streak, setStreak] = useState(() => {
    const id = localStorage.getItem(SESSION_KEY);
    return id ? updateStreak(id) : zeroStreak;
  });

  const user = userId && users[userId] ? users[userId] : null;
  const mode = user?.mode || "learner";

  useEffect(() => {
    persistUsers(users);
  }, [users]);

  const beginSession = (id) => {
    setUserId(id);
    localStorage.setItem(SESSION_KEY, id);
    setStreak(updateStreak(id));
  };

  const register = (username, password) => {
    const name = String(username || "").trim();
    if (!name) return { ok: false, error: "Username is required." };
    if (name.length < 3)
      return { ok: false, error: "Username must be at least 3 characters." };
    if (!/^[a-zA-Z0-9_.-]+$/.test(name))
      return {
        ok: false,
        error: "Username can only contain letters, numbers, dots, dashes.",
      };
    const exists = Object.values(users).some(
      (u) => u.username.toLowerCase() === name.toLowerCase()
    );
    if (exists) return { ok: false, error: "That username is already taken." };
    if (!password || password.length < 4)
      return { ok: false, error: "Password must be at least 4 characters." };

    const id = makeUserId(users);
    setUsers((u) => ({
      ...u,
      [id]: {
        id,
        username: name,
        password: encode(password),
        createdAt: new Date().toISOString(),
        mode: "learner",
      },
    }));
    beginSession(id);
    return { ok: true, userId: id };
  };

  const login = (username, password) => {
    const name = String(username || "").trim();
    const entry = Object.values(users).find(
      (u) => u.username.toLowerCase() === name.toLowerCase()
    );
    if (!entry) return { ok: false, error: "No account with that username." };
    if (entry.password !== encode(password))
      return { ok: false, error: "Incorrect password." };
    beginSession(entry.id);
    return { ok: true, userId: entry.id };
  };

  const logout = () => {
    setUserId(null);
    setStreak(zeroStreak);
    localStorage.removeItem(SESSION_KEY);
  };

  const setMode = (next) => {
    if (!userId) return;
    setUsers((u) => ({
      ...u,
      [userId]: { ...u[userId], mode: next },
    }));
  };

  const value = useMemo(
    () => ({
      user,
      userId,
      users,
      register,
      login,
      logout,
      setMode,
      mode,
      streak: streak.streak,
      longestStreak: streak.longest,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, userId, users, streak, mode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
