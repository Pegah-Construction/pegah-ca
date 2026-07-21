"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Embeds the SmartBid subcontractor-registration form.
 *
 * The form is served from another domain, so the browser won't let us read its
 * height directly. We listen for a height message in case SmartBid broadcasts one
 * (making the fit exact); otherwise we fall back to a height that shows the whole
 * form without clipping the Submit button.
 */
const FALLBACK_HEIGHT = 1344;

export default function SmartBidEmbed({ src }: { src: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
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

  return (
    <iframe
      ref={ref}
      title="Pegah Construction subcontractor registration"
      src={src}
      scrolling="no"
      style={{ height }}
      className="mx-auto block w-full max-w-[605px]"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
