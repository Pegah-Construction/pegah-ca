"use client";

import { useEffect, useState } from "react";
import {
  COMMENT_BODY_MAX,
  COMMENT_HONEYPOT_FIELD,
  COMMENT_NAME_MAX,
  relativeTime,
} from "@/lib/comments";

type Comment = { id: string; name: string; body: string; createdAt: string };

// Same browser id the like button uses — here it only powers the posting
// cooldown, so one browser can't fire off comments in a burst.
const VISITOR_KEY = "pegah_visitor";
function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    return "";
  }
}

const initialsOf = (name: string) =>
  name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default function Comments({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [justPosted, setJustPosted] = useState(false);
  // The compose box starts as a single line and opens on focus.
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/news/${articleId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(Array.isArray(d) ? d : []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [articleId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posting) return;
    setPosting(true);
    setError("");

    try {
      const res = await fetch(`/api/news/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          body,
          visitorId: getVisitorId(),
          [COMMENT_HONEYPOT_FIELD]: honeypot,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Couldn't post your comment. Please try again.");
        return;
      }
      // A honeypot hit answers 200 with no comment body — nothing to add, and
      // the bot gets the same "success" a person would.
      if (data.id) setComments((prev) => [data, ...prev]);

      setBody("");
      // Fold the box back down, the way it was before you started writing.
      setExpanded(false);
      setJustPosted(true);
      setTimeout(() => setJustPosted(false), 4000);
    } catch {
      setError("Network problem — your comment wasn't posted.");
    } finally {
      setPosting(false);
    }
  };

  // Underline-only inputs on a transparent ground — the compose box should read
  // as part of the page, not as a form dropped onto it.
  const field =
    "w-full border-b border-concrete-200/70 bg-transparent pb-1.5 text-sm outline-none transition-colors placeholder:text-concrete-300 focus:border-brand-400";

  return (
    <section className="mt-16 border-t border-concrete-200/50 pt-10">
      {/* A quiet label rather than a heading — the thread is an aside to the
          article, not a section competing with it. */}
      <h2 className="font-mono text-[11px] uppercase tracking-label text-concrete-400">
        Comments
        {comments.length > 0 && <span className="ml-1.5 text-concrete-300">{comments.length}</span>}
      </h2>

      {/* Compose. Collapsed to a single line until you click into it — the rest
          of the fields would be clutter for the majority who only read. */}
      <form
        onSubmit={submit}
        className={`mt-5 rounded-lg border px-4 py-3.5 backdrop-blur-sm transition-colors ${
          expanded
            ? "border-concrete-200/80 bg-surface/60"
            : "border-concrete-200/40 bg-surface/25 hover:border-concrete-200/70"
        }`}
      >
        {/* Name and email lead, then the comment itself. */}
        {expanded && (
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <input
              id="comment-name"
              required
              maxLength={COMMENT_NAME_MAX}
              className={field}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              id="comment-email"
              type="email"
              required
              className={field}
              placeholder="Email (not published)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}

        <textarea
          id="comment-body"
          required
          rows={expanded ? 3 : 1}
          maxLength={COMMENT_BODY_MAX}
          onFocus={() => setExpanded(true)}
          className="w-full resize-none bg-transparent text-sm leading-[1.75] text-ink outline-none placeholder:text-concrete-300"
          placeholder="Write a comment…"
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, COMMENT_BODY_MAX))}
        />

        {expanded && (
          <>
            {error && <p className="mt-3 font-mono text-[11px] text-red-600">{error}</p>}

            <div className="mt-4 flex items-center justify-end gap-4">
              {/* Only worth showing once the limit is actually in sight. */}
              {body.length > COMMENT_BODY_MAX - 200 && (
                <span className="mr-auto font-mono text-[11px] text-amber-700">
                  {COMMENT_BODY_MAX - body.length} left
                </span>
              )}
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="font-display text-xs font-medium text-concrete-400 transition-colors hover:text-ink"
              >
                Cancel
              </button>
              {/* Outlined rather than a solid fill — a filled button is the
                  heaviest thing on the page at this scale. */}
              <button
                type="submit"
                disabled={posting}
                className="rounded-full border border-brand-200 bg-brand-50/50 px-4 py-1.5 font-display text-xs font-semibold text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:opacity-60"
              >
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </>
        )}

        {/* Honeypot. Positioned off-screen rather than display:none — bots
            that skip hidden fields still fill this one. aria-hidden and
            tabIndex keep it away from people using a keyboard or a reader. */}
        <div className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor={COMMENT_HONEYPOT_FIELD}>Leave this field empty</label>
          <input
            id={COMMENT_HONEYPOT_FIELD}
            name={COMMENT_HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
      </form>

      {justPosted && (
        <p className="mt-3 font-mono text-[11px] text-brand-700">Comment posted.</p>
      )}

      {/* Thread */}
      {loading ? (
        <p className="mt-8 font-mono text-[11px] text-concrete-400">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="mt-8 font-mono text-[11px] text-concrete-400">No comments yet.</p>
      ) : (
        <ul className="mt-10 space-y-8">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3.5">
              {/* Outlined initials rather than a filled disc — keeps the eye on
                  the writing. */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-concrete-200/80 font-display text-[10px] font-semibold text-concrete-400">
                {initialsOf(c.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2.5">
                  <span className="font-display text-sm font-medium text-ink">{c.name}</span>
                  <span className="font-mono text-[11px] text-concrete-300">{relativeTime(c.createdAt)}</span>
                </div>
                {/* Plain text, rendered as text — React escapes it, so a
                    comment can't inject markup into the page. */}
                <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-[1.75] text-concrete-500">
                  {c.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
