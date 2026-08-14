"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Share the article. Uses the browser's native share sheet where it exists
 * (phones, and Safari on desktop); everywhere else it copies the link and says
 * so. Icon-only, to sit beside the like heart.
 */
export default function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const flashCopied = () => {
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    // navigator.share must be called straight from the click to keep the user
    // gesture, so no awaiting anything before it.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Dismissing the share sheet rejects — that's a cancel, not a failure,
        // so fall through to copying rather than showing an error.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      flashCopied();
    } catch {
      // Clipboard blocked (insecure context, or permission denied): select the
      // link in a throwaway field so the reader can copy it by hand.
      const field = document.createElement("input");
      field.value = url;
      document.body.appendChild(field);
      field.select();
      try { document.execCommand("copy"); flashCopied(); } catch { /* nothing more we can do */ }
      document.body.removeChild(field);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={share}
        aria-label="Share this article"
        title="Share"
        className="inline-flex items-center transition-colors text-concrete-400 hover:text-brand-700 active:scale-95"
      >
        {copied ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
          </svg>
        )}
      </button>
      {/* Announced to screen readers as well as shown, since the icon swap alone
          wouldn't tell you the link was copied. */}
      <span aria-live="polite" className="font-mono text-xs text-concrete-400">
        {copied ? "Link copied" : ""}
      </span>
    </span>
  );
}
