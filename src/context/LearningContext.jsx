import { useEffect, useMemo, useState } from "react";

import { LearningContext } from "./learning";
import { useAuth } from "./auth";
import { paths } from "../data/curriculum";

function storageKey(userId) {
  return `cyberwolf-learning-v1-${userId || "guest"}`;
}

function loadState(userId) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId))) || {};
  } catch {
    return {};
  }
}

export function LearningProvider({ children }) {
  const { userId } = useAuth();
  return (
    <LearningScope key={userId || "guest"} userId={userId}>
      {children}
    </LearningScope>
  );
}

function LearningScope({ children, userId }) {
  const [state, setState] = useState(() => loadState(userId));

  useEffect(() => {
    localStorage.setItem(storageKey(userId), JSON.stringify(state));
  }, [state, userId]);

  const value = useMemo(() => {
    const completeChapter = (courseId, chapterId) => {
      setState((s) => {
        const done = s[courseId] || [];
        if (done.includes(chapterId)) return s;
        return { ...s, [courseId]: [...done, chapterId] };
      });
    };

    const isComplete = (courseId, chapterId) =>
      (state[courseId] || []).includes(chapterId);

    const completedCount = (course) =>
      course.chapters.filter((c) => isComplete(course.id, c.id)).length;

    const courseProgress = (course) => {
      const done = completedCount(course);
      return {
        done,
        total: course.chapters.length,
        pct: Math.round((done / course.chapters.length) * 100),
      };
    };

    const resetCourse = (courseId) => {
      setState((s) => {
        const next = { ...s };
        delete next[courseId];
        return next;
      });
    };

    const isCourseComplete = (course) =>
      course.chapters.every((c) => isComplete(course.id, c.id));

    const pathProgress = (path) => {
      let done = 0;
      let total = 0;
      path.courses.forEach((course) => {
        const p = courseProgress(course);
        done += p.done;
        total += p.total;
      });
      return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
    };

    const learnedSkills = (path) => {
      const done = path.courses.filter(isCourseComplete);
      return done.flatMap((c) => c.skills || []);
    };

    const isPathComplete = (path) => path.courses.every(isCourseComplete);

    const levelProgress = (level) => {
      const levelPaths = paths.filter((p) => p.level === level);
      let done = 0;
      let total = 0;
      levelPaths.forEach((p) => {
        const pp = pathProgress(p);
        done += pp.done;
        total += pp.total;
      });
      return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
    };

    return {
      state,
      completeChapter,
      isComplete,
      completedCount,
      courseProgress,
      resetCourse,
      isCourseComplete,
      pathProgress,
      learnedSkills,
      isPathComplete,
      levelProgress,
    };
  }, [state]);

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
}
