import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { findCourse } from "../data/curriculum";
import { useLearning } from "../context/learning";

export default function Lesson() {
  const { courseId } = useParams();
  const found = findCourse(courseId);
  const { completeChapter, isComplete, courseProgress } = useLearning();

  const [chapterIdx, setChapterIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);

  if (!found) return <Navigate to="/learn" replace />;
  const { course, path } = found;

  const prog = courseProgress(course);
  const chapter = course.chapters[chapterIdx];
  const slide = chapter.slides[slideIdx];
  const done = isComplete(course.id, chapter.id);
  const isLastChapter = chapterIdx === course.chapters.length - 1;
  const isLastSlide = slideIdx === chapter.slides.length - 1;

  const goNext = () => {
    if (!isLastSlide) {
      setSlideIdx(slideIdx + 1);
      return;
    }
    completeChapter(course.id, chapter.id);
    if (!isLastChapter) {
      setChapterIdx(chapterIdx + 1);
      setSlideIdx(0);
    }
  };

  const goPrev = () => {
    if (slideIdx > 0) {
      setSlideIdx(slideIdx - 1);
      return;
    }
    if (chapterIdx > 0) {
      setChapterIdx(chapterIdx - 1);
      setSlideIdx(course.chapters[chapterIdx - 1].slides.length - 1);
    }
  };

  return (
    <main className="page">
      <div className="breadcrumb">
        <Link to="/learn">Curriculum</Link>
        <span>/</span>
        <Link to={`/learn/path/${path.id}`}>{path.title}</Link>
        <span>/</span>
        <span>{course.title}</span>
      </div>

      <div className="lesson-layout">
        <aside className="lesson-side">
          <div className="lesson-chapters">
            {course.chapters.map((c, i) => {
              const complete = isComplete(course.id, c.id);
              return (
                <button
                  key={c.id}
                  className={`lesson-chapter ${i === chapterIdx ? "on" : ""} ${complete ? "complete" : ""}`}
                  onClick={() => {
                    setChapterIdx(i);
                    setSlideIdx(0);
                  }}
                >
                  <span className="lesson-chapter-num">
                    {complete ? "✓" : i + 1}
                  </span>
                  <span>
                    {c.title}
                    <small className="muted">
                      {c.slides.length} slide{c.slides.length > 1 ? "s" : ""}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="lesson-progress">
            <span>Course progress</span>
            <b>
              {prog.done}/{prog.total} · {prog.pct}%
            </b>
          </div>
        </aside>

        <section className="card lesson-stage">
          <div className="lesson-topbar">
            <span className="pill medium">
              CHAPTER {chapterIdx + 1}/{course.chapters.length} · {chapter.title}
            </span>
            <span className="muted">
              Slide {slideIdx + 1}/{chapter.slides.length}
            </span>
          </div>

          <div className="slide-card">
            <p className="eyebrow">
              {course.icon} {course.title} · {path.title}
            </p>
            <h2>{slide.h}</h2>
            <p className="slide-body">{slide.body}</p>

            {slide.points ? (
              <ul className="lesson-points">
                {slide.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="lesson-nav">
            <button
              className="btn secondary"
              onClick={goPrev}
              disabled={chapterIdx === 0 && slideIdx === 0}
            >
              ← Back
            </button>

            {isLastSlide && !isLastChapter ? (
              <span className="muted lesson-done-hint">
                {done ? "Reviewing — " : ""}completing this chapter unlocks the
                next ✓
              </span>
            ) : null}

            {isLastSlide && isLastChapter ? (
              <Link to={course.roomId ? `/room/${course.roomId}` : "/playgrounds"} className="btn">
                Course done! {course.roomId ? "Practice in the room" : "Hunt it in the playground"} →
              </Link>
            ) : (
              <button className="btn" onClick={goNext}>
                {isLastSlide ? "Complete Chapter →" : "Next Slide →"}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
