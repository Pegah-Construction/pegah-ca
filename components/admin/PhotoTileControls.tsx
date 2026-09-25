"use client";

/**
 * The hover controls on a project photo: move it earlier, move it later, and
 * delete it. Both dashboard screens that list photos use this, so a photo
 * behaves the same wherever you meet it.
 *
 * Arrows rather than dragging: the surrounding panel is already a drop target
 * for uploading image files, and a tile you can drag inside a zone that also
 * accepts dropped files is a good way to make both feel broken.
 */
export default function PhotoTileControls({
  index,
  total,
  busy,
  compact,
  onMove,
  onDelete,
}: {
  index: number;
  total: number;
  busy?: boolean;
  /** Tighter buttons for the smaller tiles in the edit dialog. */
  compact?: boolean;
  onMove: (from: number, to: number) => void;
  onDelete: () => void;
}) {
  const size = compact ? "h-3 w-3" : "h-3.5 w-3.5";
  const pad = compact ? "p-1" : "p-1.5";
  const btn = `rounded-full bg-black/60 ${pad} text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-30`;

  return (
    <>
      {/* First photo is the one the public site leads with, so it says so
          rather than leaving the editor to work it out. */}
      {index === 0 && (
        <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-full bg-brand-700/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-label text-white">
          Cover
        </span>
      )}

      <div className={`absolute inset-x-1.5 bottom-1.5 hidden items-center justify-between gap-1 group-hover:flex ${busy ? "opacity-60" : ""}`}>
        <button
          type="button"
          onClick={() => onMove(index, index - 1)}
          disabled={busy || index === 0}
          title="Move earlier"
          aria-label="Move photo earlier"
          className={btn}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={size}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="rounded-full bg-black/60 px-1.5 font-mono text-[10px] text-white">{index + 1}</span>
        <button
          type="button"
          onClick={() => onMove(index, index + 1)}
          disabled={busy || index === total - 1}
          title="Move later"
          aria-label="Move photo later"
          className={btn}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={size}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        title="Delete photo"
        aria-label="Delete photo"
        className={`absolute right-1.5 top-1.5 hidden rounded-full bg-black/60 ${pad} text-white group-hover:block hover:bg-black/80`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={size}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </>
  );
}
