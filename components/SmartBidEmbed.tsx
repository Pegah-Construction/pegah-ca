"use client";

import { useEffect, useState } from "react";

/**
 * Embeds the SmartBid subcontractor-registration form.
 *
 * The form is served from another domain, so the browser won't let us read its
 * height directly. We listen for a height message in case SmartBid broadcasts one
 * (making the fit exact); otherwise we fall back to a height that shows the whole
 * form without clipping the Submit button.
 *
 * Two things the frame has to allow for, because SmartBid's own page is a fixed
 * ~605px layout that doesn't reflow:
 *   - sideways scrolling, so the right-hand half of every row is still reachable
 *     on a phone rather than being cut off the edge;
 *   - `scrolling="auto"`, so if the form outgrows the height we guessed (it
 *     grows as work areas and trade divisions are added) the rest can still be
 *     scrolled to instead of being sealed off.
 */
const FALLBACK_HEIGHT = 1344;
const FORM_WIDTH = 605;

export default function SmartBidEmbed({ src }: { src: string }) {
  const [height, setHeight] = useState(FALLBACK_HEIGHT);

  useEffect(() => {
    let origin = "";
    try {
      origin = new URL(src).origin;
    } catch {
      return;
    }

    function onMessage(e: MessageEvent) {
      if (e.origin !== origin) return;
      const d = e.data as unknown;
      let h: number | undefined;
      if (typeof d === "number") h = d;
      else if (typeof d === "string" && /height/i.test(d)) {
        const m = d.match(/(\d{3,5})/);
        if (m) h = parseInt(m[1], 10);
      } else if (d && typeof d === "object") {
        const o = d as Record<string, unknown>;
        const cand = o.height ?? o.frameHeight ?? o.scrollHeight ?? o.value;
        if (typeof cand === "number") h = cand;
        else if (typeof cand === "string") h = parseInt(cand, 10);
      }
      if (h && h > 400 && h < 6000) setHeight(Math.ceil(h));
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [src]);

  // The outer box is centred and never wider than the form; the inner box is
  // what scrolls, so on a narrow screen the form starts at its own left edge
  // instead of being centred with half of it out of reach.
  return (
    <div className="mx-auto" style={{ maxWidth: FORM_WIDTH }}>
      <div className="overflow-x-auto overscroll-x-contain rounded-lg">
        <iframe
          title="Pegah Construction subcontractor registration"
          src={src}
          scrolling="auto"
          style={{ height, width: FORM_WIDTH }}
          className="block max-w-none bg-white"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
