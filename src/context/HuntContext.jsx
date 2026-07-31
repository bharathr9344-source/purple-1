import { useEffect, useMemo, useState } from "react";

import { HuntContext } from "./hunt";
import { useAuth } from "./auth";
import { playgrounds } from "../data/playgrounds";

function storageKey(userId) {
  return `cyberwolf-hunt-v1-${userId || "guest"}`;
}

function loadState(userId) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId))) || {};
  } catch {
    return {};
  }
}

const TOTAL_CHALLENGES = playgrounds.reduce(
  (n, p) => n + p.apps.length,
  0
);

export function HuntProvider({ children }) {
  const { userId } = useAuth();
  return (
    <HuntScope key={userId || "guest"} userId={userId}>
      {children}
    </HuntScope>
  );
}

function HuntScope({ children, userId }) {
  const [state, setState] = useState(() => loadState(userId));

  useEffect(() => {
    localStorage.setItem(storageKey(userId), JSON.stringify(state));
  }, [state, userId]);

  const value = useMemo(() => {
    const captureFlag = (playgroundId, appId) => {
      setState((s) => {
        const done = s[playgroundId] || [];
        if (done.includes(appId)) return s;
        return { ...s, [playgroundId]: [...done, appId] };
      });
    };

    const isCaptured = (playgroundId, appId) =>
      (state[playgroundId] || []).includes(appId);

    const capturedForPlayground = (playground) =>
      (state[playground.id] || []).filter((appId) =>
        playground.apps.some((app) => app.id === appId)
      );

    const playgroundProgress = (playground) => {
      const done = capturedForPlayground(playground).length;
      return {
        done,
        total: playground.apps.length,
        pct: Math.round((done / playground.apps.length) * 100),
      };
    };

    const totalFlags = Object.values(state).flat().filter(Boolean).length;
    const isPlaygroundComplete = (playground) =>
      capturedForPlayground(playground).length === playground.apps.length;

    const completePlaygrounds = playgrounds.filter(isPlaygroundComplete);

    const resetPlayground = (playgroundId) => {
      setState((s) => {
        const next = { ...s };
        delete next[playgroundId];
        return next;
      });
    };

    return {
      state,
      captureFlag,
      isCaptured,
      capturedForPlayground,
      playgroundProgress,
      totalFlags,
      isPlaygroundComplete,
      completePlaygrounds,
      totalChallenges: TOTAL_CHALLENGES,
      resetPlayground,
    };
  }, [state]);

  return (
    <HuntContext.Provider value={value}>{children}</HuntContext.Provider>
  );
}
