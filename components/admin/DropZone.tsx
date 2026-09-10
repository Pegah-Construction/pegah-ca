"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Only image files — dropping a PDF or a folder shouldn't start an upload. */
function imageFiles(dt: DataTransfer | null): File[] {
  if (!dt) return [];
  return Array.from(dt.files).filter((f) => f.type.startsWith("image/"));
}

/** True when the drag actually carries files (not a text selection or a dragged link). */
function hasFiles(dt: DataTransfer | null) {
  return !!dt && Array.from(dt.types).includes("Files");
}

/** An image dragged out of a web page arrives as a URL, with no file attached. */
function hasUrlOnly(dt: DataTransfer | null) {
  return !!dt && !hasFiles(dt) && Array.from(dt.types).some((t) => t === "text/uri-list" || t === "text/html");
}

/**
 * Small, non-blocking notice for upload problems.
 *
 * A blocking `alert()` freezes React mid-handler, so the drag overlay stays
 * painted underneath the dialog until it's dismissed. This lets the overlay
 * clear first and says what happened in the corner instead.
 */
export function notifyDropIssue(message: string) {
  if (typeof document === "undefined") return;

  const ID = "drop-issue-notice";
  document.getElementById(ID)?.remove();

  const el = document.createElement("div");
  el.id = ID;
  el.setAttribute("role", "status");
  // bg-ink / text-paper both flip with the theme, so this stays legible in dark mode.
  el.className =
    "fixed bottom-5 left-1/2 z-[60] flex w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 items-start gap-3 " +
    "rounded-lg bg-ink px-4 py-2.5 text-sm text-paper shadow-lg";

  const text = document.createElement("span");
  text.textContent = message;
  el.appendChild(text);

  const close = document.createElement("button");
  close.type = "button";
  close.setAttribute("aria-label", "Dismiss");
  close.textContent = "×";
  close.className = "-mr-1 shrink-0 px-1 text-base leading-none text-paper/60 hover:text-paper";
  close.onclick = () => el.remove();
  el.appendChild(close);

  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 6000);
}

/**
 * Drag-and-drop file handling for an arbitrary element.
 *
 * `dragging` is true only while a file drag is over the element, so callers can
 * style the drop target. Enter/leave events fire for every child element, so we
 * count depth instead of toggling a boolean.
 */
export function useImageDrop({
  onFiles,
  disabled = false,
  multiple = true,
  guideOnUrlDrop = true,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  /** Explain why an image dragged from a web page didn't upload. Turn off where
   *  the element handles URL drops itself (the article editor inserts them). */
  guideOnUrlDrop?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  const owns = useCallback(
    (dt: DataTransfer | null) => hasFiles(dt) || (guideOnUrlDrop && hasUrlOnly(dt)),
    [guideOnUrlDrop],
  );

  const reset = useCallback(() => {
    depth.current = 0;
    setDragging(false);
  }, []);

  // A drag can end without a dragleave on this element — cancelled with Esc,
  // dropped somewhere else, or dragged back out of the window — which would
  // otherwise leave the highlight box stuck on screen.
  useEffect(() => {
    if (!dragging) return;
    const clear = () => reset();
    const clearIfOutsideWindow = (e: DragEvent) => { if (!e.relatedTarget) reset(); };
    window.addEventListener("dragend", clear);
    window.addEventListener("drop", clear);
    window.addEventListener("dragleave", clearIfOutsideWindow);
    return () => {
      window.removeEventListener("dragend", clear);
      window.removeEventListener("drop", clear);
      window.removeEventListener("dragleave", clearIfOutsideWindow);
    };
  }, [dragging, reset]);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    if (disabled || !owns(e.dataTransfer)) return;
    e.preventDefault();
    depth.current += 1;
    setDragging(true);
  }, [disabled, owns]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    if (disabled || !owns(e.dataTransfer)) return;
    // Required, or the browser navigates to the dropped file instead.
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, [disabled, owns]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (disabled || !owns(e.dataTransfer)) return;
    e.preventDefault();
    depth.current -= 1;
    if (depth.current <= 0) reset();
  }, [disabled, owns, reset]);

  const onDrop = useCallback((e: React.DragEvent) => {
    if (disabled || !owns(e.dataTransfer)) return;
    e.preventDefault();
    e.stopPropagation();
    reset();
    const files = imageFiles(e.dataTransfer);
    // Silence is the worst outcome here: an image dragged out of another browser
    // tab, or a dropped folder, carries no usable file and just looks broken.
    if (files.length === 0) {
      notifyDropIssue(
        hasFiles(e.dataTransfer)
          ? "That isn't an image file. Drop a JPG, PNG, or WebP — open a folder and drop the photos inside it."
          : "An image dragged off a web page carries no file. Save it to your computer first, then drop the saved file."
      );
      return;
    }
    onFiles(multiple ? files : files.slice(0, 1));
  }, [disabled, multiple, onFiles, owns, reset]);

  return { dragging, dropProps: { onDragEnter, onDragOver, onDragLeave, onDrop } };
}

/**
 * A click-to-browse / drag-to-drop image target. Renders a dashed panel by
 * default; pass `children` to decorate the inside (previews, hints, spinners).
 */
export function DropZone({
  onFiles,
  multiple = true,
  disabled = false,
  busy = false,
  label,
  hint = "or drag and drop",
  className = "",
  children,
}: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  busy?: boolean;
  label: string;
  hint?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { dragging, dropProps } = useImageDrop({ onFiles, disabled: disabled || busy, multiple });

  return (
    <div
      {...dropProps}
      onClick={() => !disabled && !busy && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (disabled || busy) return;
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); }
      }}
      role="button"
      tabIndex={disabled || busy ? -1 : 0}
      aria-label={label}
      aria-disabled={disabled || busy}
      className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
        dragging
          ? "border-brand-500 bg-brand-50"
          : "border-concrete-200 bg-concrete-50 hover:border-brand-400 hover:bg-brand-50"
      } ${disabled || busy ? "cursor-not-allowed opacity-60" : ""} ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="sr-only"
        disabled={disabled || busy}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
          e.target.value = "";
          if (files.length) onFiles(multiple ? files : files.slice(0, 1));
        }}
      />
      {children ?? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-6 w-6 ${dragging ? "text-brand-600" : "text-concrete-400"}`}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="font-display text-sm font-semibold text-ink">
            {dragging ? "Drop to upload" : label}
          </span>
          {hint && <span className="text-xs text-concrete-400">{hint}</span>}
        </>
      )}
    </div>
  );
}

/**
 * Invisible overlay that appears only while files are dragged over the parent —
 * for turning an existing panel into a drop target without changing its layout.
 * The parent must be `relative`.
 */
export function DropOverlay({ dragging, text = "Drop images to upload" }: { dragging: boolean; text?: string }) {
  if (!dragging) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] border-2 border-dashed border-brand-500 bg-brand-50/90">
      <span className="flex items-center gap-2 font-display text-sm font-bold text-brand-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {text}
      </span>
    </div>
  );
}

/**
 * Wraps arbitrary content in a drop target with the overlay already attached —
 * for rows in a list, where a hook per item isn't possible.
 */
export function DropTarget({
  onFiles,
  onClick,
  multiple = true,
  disabled = false,
  text,
  className = "",
  children,
}: {
  onFiles: (files: File[]) => void;
  onClick?: () => void;
  multiple?: boolean;
  disabled?: boolean;
  text?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { dragging, dropProps } = useImageDrop({ onFiles, disabled, multiple });
  return (
    <div {...(disabled ? {} : dropProps)} onClick={onClick} className={`relative ${className}`}>
      {children}
      {!disabled && <DropOverlay dragging={dragging} text={text} />}
    </div>
  );
}
