"use client";

import { useEffect, useState } from "react";

const VISITOR_KEY = "pegah_visitor";

/**
 * Returns this browser's anonymous visitor id, creating one on first use.
 * It identifies a browser so it can't like the same post twice and can undo its
 * own like — nothing more. If localStorage is unavailable (private mode with
 * storage blocked), we fall back to a per-session id: liking still works, it
 * just won't be remembered next visit.
 */
function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

export default function LikeButton({
  articleId,
  initialCount,
}: {
  articleId: string;
  initialCount: number;
}) {
  // Server-rendered count shows immediately; whether *this* browser already
  // liked it is only knowable client-side, so it arrives a moment later.
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const id = getVisitorId();
    setVisitorId(id);
    fetch(`/api/news/${articleId}/like?visitorId=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.count === "number") setCount(d.count);
        setLiked(Boolean(d.liked));
      })
      .catch(() => {});
  }, [articleId]);

  const toggle = async () => {
    if (!visitorId || pending) return;
    setPending(true);

    // Optimistic: the heart responds on click rather than after a round trip.
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => c + (wasLiked ? -1 : 1));

    try {
      const res = wasLiked
        ? await fetch(`/api/news/${articleId}/like?visitorId=${encodeURIComponent(visitorId)}`, { method: "DELETE" })
        : await fetch(`/api/news/${articleId}/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visitorId }),
          });
      const data = await res.json();
      // Trust the server's number over the optimistic one — it accounts for
      // everyone else's likes since the page loaded.
      if (typeof data.count === "number") setCount(data.count);
      if (typeof data.liked === "boolean") setLiked(data.liked);
    } catch {
      // Network failed — put the button back the way it was.
      setLiked(wasLiked);
      setCount((c) => c + (wasLiked ? 1 : -1));
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!visitorId || pending}
      aria-pressed={liked}
      // The heart carries no text, so the accessible name has to say what it
      // does and what the number means.
      aria-label={`${liked ? "Unlike" : "Like"} this article — ${count} ${count === 1 ? "like" : "likes"}`}
      title={liked ? "Unlike" : "Like"}
      // Dim only while a request is in flight. The button is also disabled for
      // the moment before the visitor id is read from localStorage, but dimming
      // for that would show a flash of grey on every page load.
      className={`inline-flex items-center gap-2 transition-colors active:scale-95 ${
        pending ? "opacity-60" : ""
      } ${liked ? "text-red-600" : "text-concrete-400 hover:text-red-600"}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-7 w-7 transition-transform ${liked ? "scale-110" : ""}`}
        aria-hidden="true"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
      <span className="font-mono text-sm tabular-nums">{count}</span>
    </button>
  );
}
