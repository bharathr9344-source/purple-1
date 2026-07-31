import { Link, Navigate, useParams } from "react-router-dom";

import { findPath } from "../data/curriculum";
import { useLearning } from "../context/learning";
import { useAuth } from "../context/auth";

export default function PathPage() {
  const { pathId } = useParams();
  const { user } = useAuth();
  const { pathProgress, courseProgress, learnedSkills, isPathComplete } =
    useLearning();
  const path = findPath(pathId);

  if (!path) return <Navigate to="/learn" replace />;

  const signedIn = Boolean(user);
  const pp = signedIn ? pathProgress(path) : null;
  const skills = signedIn ? learnedSkills(path) : [];
  const complete = signedIn && isPathComplete(path);

  return (
    <main className="page">
      <header className="dash-head">
        <Link to="/learn" className="muted">
          ← All paths
        </Link>
        <p className="eyebrow">
          LEVEL {path.level} · {path.courses.length} COURSES
        </p>
        <h2 className="section-title">
          {path.emoji} {path.title}
        </h2>
        <p className="muted">{path.description}</p>
      </header>

      {signedIn ? (
        <div className="hunt-progress big">
          <div className="hunt-progress-bar">
            <div className="hunt-progress-fill" style={{ width: `${pp.pct}%` }} />
          </div>
          <span className="muted">
            {pp.done}/{pp.total} chapters · {skills.length} skills earned
          </span>
        </div>
      ) : (
        <p className="muted">
          <Link to="/login" className="btn ghost">
            Sign in
          </Link>{" "}
          to track your progress.
        </p>
      )}

      {complete ? (
        <div className="hunt-complete">
          <p className="eyebrow">PATH COMPLETE</p>
          <h3>🎉 You mastered {path.title}!</h3>
          <p>
            Skills earned: {skills.map((s) => `#${s}`).join(" · ")} — put them
            to work in the playgrounds.
          </p>
          <div className="hunt-complete-actions">
            <Link to="/playgrounds" className="btn">
              🏴 Hunt in the Playgrounds
            </Link>
          </div>
        </div>
      ) : null}

      <div className="path-courses">
        {path.courses.map((course) => {
          const prog = courseProgress(course);
          const done = prog.done === prog.total;
          return (
            <Link
              to={`/learn/${course.id}`}
              key={course.id}
              className={`card learn-course-card ${done ? "done" : ""}`}
            >
              <div className="learn-card-top">
                <span className="learn-icon">{course.icon}</span>
                <span className="chip">{course.owasp || "Course"}</span>
              </div>
              <h3>
                {course.title} {done ? "✓" : ""}
              </h3>
              <div className="learn-meta">
                <span>📚 {course.chapters.length} chapters</span>
                <span>⏱ {course.minutes} min</span>
              </div>
              <div className="room-progress">
                <div className="room-progress-bar">
                  <span style={{ width: `${prog.pct}%` }} />
                </div>
                <span className="room-progress-label">
                  {prog.done}/{prog.total} chapters · {prog.pct}%
                </span>
              </div>
              <span className="btn">
                {prog.done > 0 ? "Continue Learning" : "Start Course"}
              </span>
            </Link>
          );
        })}
      </div>

      {skills.length > 0 ? (
        <section className="card analysis-card">
          <p className="eyebrow">SKILLS EARNED IN THIS PATH</p>
          <div className="skill-chips">
            {skills.map((s) => (
              <span key={s} className="filter-chip on">
                #{s}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
