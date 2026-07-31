import { useEffect, useMemo, useState } from "react";

import { ProgressContext } from "./progress";
import { useAuth } from "./auth";

const emptyProgress = { rooms: {} };

function storageKey(userId) {
  return `cyberwolf-progress-v1-${userId || "guest"}`;
}

function loadProgress(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return emptyProgress;
    const parsed = JSON.parse(raw);
    return { rooms: parsed.rooms || {} };
  } catch {
    return emptyProgress;
  }
}

function defaultRoom() {
  return { status: "in-progress", stepsSolved: [], attempts: {}, hints: {}, startedAt: null };
}

export function ProgressProvider({ children }) {
  const { userId } = useAuth();
  return (
    <ProgressScope key={userId || "guest"} userId={userId}>
      {children}
    </ProgressScope>
  );
}

function ProgressScope({ children, userId }) {
  const [progress, setProgress] = useState(() => loadProgress(userId));

  useEffect(() => {
    localStorage.setItem(storageKey(userId), JSON.stringify(progress));
  }, [progress, userId]);

  const value = useMemo(() => {
    const getRoom = (roomId) => progress.rooms[roomId] || defaultRoom();

    const solveStep = (roomId, stepId) => {
      setProgress((p) => {
        const existed = p.rooms[roomId];
        const room = existed || defaultRoom();
        if (room.stepsSolved.includes(stepId)) return p;
        return {
          ...p,
          rooms: {
            ...p.rooms,
            [roomId]: {
              ...room,
              status: "in-progress",
              startedAt: existed ? room.startedAt : Date.now(),
              stepsSolved: [...room.stepsSolved, stepId],
            },
          },
        };
      });
    };

    const failAttempt = (roomId, stepId) => {
      setProgress((p) => {
        const room = p.rooms[roomId] || defaultRoom();
        return {
          ...p,
          rooms: {
            ...p.rooms,
            [roomId]: {
              ...room,
              status: "in-progress",
              attempts: { ...room.attempts, [stepId]: (room.attempts[stepId] || 0) + 1 },
            },
          },
        };
      });
    };

    const takeHint = (roomId, stepId) => {
      setProgress((p) => {
        const room = p.rooms[roomId] || defaultRoom();
        return {
          ...p,
          rooms: {
            ...p.rooms,
            [roomId]: {
              ...room,
              hints: { ...room.hints, [stepId]: (room.hints[stepId] || 0) + 1 },
            },
          },
        };
      });
    };

    const completeRoom = (roomId) => {
      setProgress((p) => {
        const room = p.rooms[roomId];
        if (!room || room.status === "completed") return p;
        const timeSec = room.startedAt ? Math.round((Date.now() - room.startedAt) / 1000) : 0;
        return {
          ...p,
          rooms: {
            ...p.rooms,
            [roomId]: {
              ...room,
              status: "completed",
              timeSec,
              completedAt: new Date().toISOString(),
            },
          },
        };
      });
    };

    const resetProgress = () => setProgress(emptyProgress);

    return { progress, getRoom, solveStep, failAttempt, takeHint, completeRoom, resetProgress };
  }, [progress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
