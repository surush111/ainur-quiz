"use client";

export default function ProgressTrail({ current, total }) {
  const dots = Array.from({ length: total }, (_, i) => i);
  const percent = Math.round((current / total) * 100);

  return (
    <div className="progress-trail" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
      <div className="progress-trail__label">
        Шаг {current} из {total}
      </div>
      <div className="progress-trail__track">
        <div className="progress-trail__fill" style={{ width: `${percent}%` }} />
        <div className="progress-trail__dots">
          {dots.map((i) => (
            <span
              key={i}
              className={
                "progress-trail__dot" +
                (i < current ? " progress-trail__dot--done" : "") +
                (i === current - 1 ? " progress-trail__dot--current" : "")
              }
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .progress-trail {
          width: 100%;
        }
        .progress-trail__label {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-muted);
          margin-bottom: 10px;
          letter-spacing: 0.02em;
        }
        .progress-trail__track {
          position: relative;
          height: 4px;
          background: var(--color-border);
          border-radius: 999px;
          overflow: visible;
        }
        .progress-trail__fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: var(--color-accent);
          border-radius: 999px;
          transition: width 0.5s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .progress-trail__dots {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          transform: translateY(-50%);
        }
        .progress-trail__dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-border);
          transition: background 0.3s ease, transform 0.3s ease;
        }
        .progress-trail__dot--done {
          background: var(--color-accent);
        }
        .progress-trail__dot--current {
          transform: scale(1.6);
        }
      `}</style>
    </div>
  );
}
