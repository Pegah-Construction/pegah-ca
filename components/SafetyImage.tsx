"use client";

import { useState } from "react";

/**
 * Shows /safety.jpg (on-site safety photo) once supplied; until then renders a
 * clean striped placeholder instead of a broken image.
 */
export default function SafetyImage() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="image-slot flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl"
        role="img"
        aria-label="On-site health and safety"
      >
        <span className="rounded-md border border-concrete-300 bg-paper/90 px-3 py-1.5 font-mono text-[11px] tracking-wide text-concrete-500">
          On-site safety photo
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/health%20and%20safety.jpg"
      alt="On-site health and safety at Pegah Construction"
      onError={() => setFailed(true)}
      className="aspect-[4/3] w-full rounded-2xl object-cover shadow-md"
    />
  );
}
