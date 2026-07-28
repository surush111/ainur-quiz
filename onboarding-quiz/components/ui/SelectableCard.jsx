"use client";

export default function SelectableCard({ label, selected, onClick, multi = false }) {
  return (
    <button
      type="button"
      className={"selectable-card" + (selected ? " selectable-card--selected" : "")}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span
        className={
          "selectable-card__marker" +
          (multi ? " selectable-card__marker--square" : "") +
          (selected ? " selectable-card__marker--selected" : "")
        }
      >
        {selected && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path
              d="M1 4.5L4 7.5L10 1.5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="selectable-card__label">{label}</span>

      <style jsx>{`
        .selectable-card {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 15px 18px;
          background: var(--color-surface);
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md);
          text-align: left;
          font-size: 15.5px;
          font-weight: 500;
          color: var(--color-text);
          transition: border-color 0.18s ease, background 0.18s ease, transform 0.12s ease;
        }
        .selectable-card:hover {
          border-color: #d8c3a5;
          background: var(--color-surface-soft);
        }
        .selectable-card:active {
          transform: scale(0.99);
        }
        .selectable-card--selected {
          border-color: var(--color-accent);
          background: var(--color-accent-soft);
        }
        .selectable-card__marker {
          flex: 0 0 auto;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1.5px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.18s ease, border-color 0.18s ease;
        }
        .selectable-card__marker--square {
          border-radius: 6px;
        }
        .selectable-card__marker--selected {
          background: var(--color-accent);
          border-color: var(--color-accent);
        }
        .selectable-card__label {
          line-height: 1.35;
        }
      `}</style>
    </button>
  );
}
