"use client";

import { useState } from "react";
import { getStorageUrl } from "@/lib/storage-url";

/**
 * Square card image for a service. Services are edited as text lines, so the
 * image is optional and may point at a file that's since been removed — either
 * way this falls back to the striped placeholder rather than a broken image.
 */
export default function ServiceImage({
  src,
  title,
  index,
}: {
  src: string;
  title: string;
  index: number;
}) {
  const [failed, setFailed] = useState(false);
  const url = getStorageUrl(src);

  return (
    <div className="overflow-hidden rounded-2xl border border-concrete-200 bg-concrete-100 shadow-sm">
      {!url || failed ? (
        // No photo yet: the card's number on the striped placeholder, rather
        // than repeating the title that already sits right below it.
        <div
          className="image-slot flex aspect-square items-center justify-center"
          role="img"
          aria-label={`${title} — photo to come`}
        >
          <span className="select-none font-display text-5xl font-black text-concrete-300">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={title}
          onError={() => setFailed(true)}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      )}
    </div>
  );
}
