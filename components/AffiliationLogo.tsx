"use client";

import { useState } from "react";

/**
 * Renders an affiliation/partner logo. If the image file hasn't been supplied
 * yet (or fails to load), it falls back to a clean text badge so the section
 * never shows a broken image.
 */
export default function AffiliationLogo({
  name,
  logo,
  grayscale = false,
  large = false,
}: {
  name: string;
  logo: string;
  /** Show the logo desaturated until hovered. */
  grayscale?: boolean;
  /** The roomier size used by the full affiliation rows. */
  large?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="font-display text-base font-semibold text-concrete-500 transition-colors group-hover:text-brand-700">
        {name}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={name}
      onError={() => setFailed(true)}
      className={[
        large ? "h-10 w-auto max-w-[140px]" : "h-9 w-auto max-w-[130px]",
        "object-contain",
        grayscale
          ? "opacity-70 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0"
          : "transition-opacity group-hover:opacity-80",
      ].join(" ")}
    />
  );
}
