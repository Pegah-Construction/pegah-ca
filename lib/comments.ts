// Shared rules for reader comments, used by both the public form and the API so
// the two can't disagree about what's acceptable.

export const COMMENT_NAME_MAX = 80;
export const COMMENT_BODY_MAX = 2000;

// A comment publishes the moment it's posted, so the only thing standing between
// a bot and the blog is this. Two cheap defences that cost readers nothing:
//  - a honeypot field, hidden from people but filled in by naive bots
//  - a cooldown, so one browser can't post in a tight loop
export const COMMENT_HONEYPOT_FIELD = "website";
export const COMMENT_COOLDOWN_MS = 30_000;

export type CommentInput = { name?: unknown; email?: unknown; body?: unknown };

/**
 * Validates and normalises a submitted comment. Returns either the cleaned
 * fields or the first problem, phrased for the reader.
 */
export function validateComment(input: CommentInput):
  | { ok: true; name: string; email: string; body: string }
  | { ok: false; error: string } {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";

  if (!name) return { ok: false, error: "Please add your name." };
  if (name.length > COMMENT_NAME_MAX) {
    return { ok: false, error: `Name must be ${COMMENT_NAME_MAX} characters or fewer.` };
  }
  // Deliberately loose: the point is to catch typos, not to police what a valid
  // address looks like.
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please add a valid email address." };
  }
  if (!body) return { ok: false, error: "Please write a comment." };
  if (body.length > COMMENT_BODY_MAX) {
    return { ok: false, error: `Comment must be ${COMMENT_BODY_MAX} characters or fewer.` };
  }

  return { ok: true, name, email, body };
}

// "3 days ago" style stamp for the public list — friendlier than a raw date on
// something conversational.
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const seconds = Math.round((Date.now() - then) / 1000);
  if (!Number.isFinite(seconds)) return "";
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}
