// SmartBid (ConstructConnect) tender integration.
//
// The tender sync uses SmartBid's public-projects endpoint, which authenticates
// with a ClientKey query param — no header credential needed:
//
//   GET {SMARTBID_API_BASE}/project/publicProjects?ClientKey=…&OpenToBid=true&…
//   → { "publicProject": [ { link, title, address, city, state, zip,
//                            bidDueDate, projectType, bidManager, … } ] }
//
// Required:
//   SMARTBID_API_BASE          Base URL of the API (host from the API explorer)
//   SMARTBID_CLIENT_KEY        The "ClientKey" (key for the user client URL)
//
// Optional:
//   SMARTBID_PROJECTS_PATH        Override the path (default: /project/publicProjects)
//   SMARTBID_OFFICE_KEY           Restrict to one office
//   SMARTBID_STATUSES             Comma-separated status flags to include
//                                 (default: "OpenToBid,Upcoming"; others: PastBidDueDate,
//                                 ClosedToBid, InNegotiation, Awarded, Construction, Completed)
//   SMARTBID_PROJECT_URL_TEMPLATE URL template for a project, with {link}
//                                 (used for the tender's outbound bid link)
//
// Header auth (SMARTBID_AUTH = apikey|passport|oauth and its keys) is only needed
// for other, account-protected endpoints — the public-projects sync ignores it.
//
// mapProjectToTender maps the confirmed publicProject fields; it keeps alias
// fallbacks for fields cut off in the API docs (email/phone/description/status).

import { db } from "@/lib/db";

export class SmartBidNotConfiguredError extends Error {
  constructor(message = "SmartBid API is not configured.") {
    super(message);
    this.name = "SmartBidNotConfiguredError";
  }
}

// The public-projects endpoint authenticates with a ClientKey query param, so a
// base URL + ClientKey is all that's required to sync.
export function isSmartBidConfigured(): boolean {
  return !!process.env.SMARTBID_API_BASE && !!process.env.SMARTBID_CLIENT_KEY;
}

// ── Authentication ────────────────────────────────────────────────────────────
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getOAuthToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) return cachedToken.value;

  const res = await fetch(process.env.SMARTBID_TOKEN_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SMARTBID_CLIENT_ID!,
      client_secret: process.env.SMARTBID_CLIENT_SECRET!,
    }),
  });
  if (!res.ok) throw new Error(`SmartBid OAuth token request failed (${res.status}).`);
  const json = await res.json();
  const value = json.access_token as string;
  const ttl = (json.expires_in as number) ?? 3600;
  cachedToken = { value, expiresAt: now + ttl * 1000 };
  return value;
}

// Optional auth header. The public-projects endpoint needs none (it uses the
// ClientKey query param), so this returns {} unless a credential is explicitly
// configured — for other, account-protected endpoints.
async function authHeaders(): Promise<Record<string, string>> {
  const mode = (process.env.SMARTBID_AUTH || "").toLowerCase();
  // OAuth: Authorization: Bearer {OAuthToken}
  if (mode === "oauth" && process.env.SMARTBID_TOKEN_URL) {
    return { Authorization: `Bearer ${await getOAuthToken()}` };
  }
  // Passport: a session token from a SmartBid user login (expires on logout).
  if (mode === "passport" && process.env.SMARTBID_PASSPORT_KEY) {
    return { PassportKey: process.env.SMARTBID_PASSPORT_KEY };
  }
  if (process.env.SMARTBID_API_KEY) {
    const header = process.env.SMARTBID_AUTH_HEADER || "Authorization";
    const scheme = process.env.SMARTBID_AUTH_SCHEME ?? "Bearer ";
    return { [header]: `${scheme}${process.env.SMARTBID_API_KEY}` };
  }
  return {};
}

// ── Fetch ───────────────────────────────────────────────────────────────────
// GET project/publicProjects?ClientKey=…&<status>=true&SortBy=BidDueDate&ResultType=json
// Returns { publicProject: [ … ] }. At least one status flag is required — by
// default we pull the live opportunities (OpenToBid + Upcoming). Override which
// statuses via SMARTBID_STATUSES (comma-separated, e.g. "OpenToBid,InNegotiation").
export type SmartBidProject = Record<string, unknown>;

const STATUS_FLAGS = [
  "Upcoming", "OpenToBid", "PastBidDueDate", "ClosedToBid",
  "InNegotiation", "Awarded", "Construction", "Completed",
];

export async function fetchSmartBidProjects(): Promise<SmartBidProject[]> {
  if (!isSmartBidConfigured()) throw new SmartBidNotConfiguredError();

  const base = process.env.SMARTBID_API_BASE!.replace(/\/$/, "");
  const rawPath = process.env.SMARTBID_PROJECTS_PATH || "/project/publicProjects";
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  const params = new URLSearchParams({
    ClientKey: process.env.SMARTBID_CLIENT_KEY!,
    SortBy: "BidDueDate",
    ResultType: "json",
  });
  if (process.env.SMARTBID_OFFICE_KEY) params.set("OfficeKey", process.env.SMARTBID_OFFICE_KEY);

  const requested = (process.env.SMARTBID_STATUSES || "OpenToBid,Upcoming")
    .split(",").map((s) => s.trim()).filter((s) => STATUS_FLAGS.includes(s));
  for (const flag of requested.length ? requested : ["OpenToBid", "Upcoming"]) params.set(flag, "true");

  const url = `${base}${path}?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", ...(await authHeaders()) },
    signal: AbortSignal.timeout(30_000),
    cache: "no-store", // always read live from SmartBid
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SmartBid API ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  if (Array.isArray(json)) return json;
  for (const key of ["publicProject", "publicProjects", "data", "items", "results", "projects"]) {
    if (Array.isArray((json as Record<string, unknown>)[key])) {
      return (json as Record<string, SmartBidProject[]>)[key];
    }
  }
  return [];
}

// ── Mapping ───────────────────────────────────────────────────────────────────
// CONFIRM: match these to the real field names in a sample SmartBid response.
// Reads several likely aliases so it works across naming styles until confirmed.
function pick(o: SmartBidProject, ...keys: string[]): string {
  for (const k of keys) {
    const v = o[k];
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  return "";
}

export function mapProjectToTender(p: SmartBidProject) {
  // "link" is the public-project identifier (also used to build its public URL).
  const link = pick(p, "link", "id", "projectId", "projectKey", "publicId");
  const bidUrl = /^https?:\/\//.test(link)
    ? link
    : process.env.SMARTBID_PROJECT_URL_TEMPLATE
      ? process.env.SMARTBID_PROJECT_URL_TEMPLATE.replace("{link}", link)
      : "";

  // "code" is a comma-separated string of "CSI - description" entries; older
  // shapes used an array under codes/divisions/tradeCodes.
  const codeRaw = (p.code ?? p.codes ?? p.divisions ?? p.tradeCodes) as unknown;
  const codes = Array.isArray(codeRaw)
    ? codeRaw.map(String)
    : typeof codeRaw === "string"
      ? codeRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  // The public feed prints "No Due Date" when a project has no bid deadline.
  const dueRaw = pick(p, "bidDueDate", "dueDate", "closingDate");
  const closing = /no due date/i.test(dueRaw) ? "" : dueRaw;

  const projectType = pick(p, "projectType", "type", "bidType");

  return {
    id: `sb_${link}`,
    ref: pick(p, "projectNumber", "number", "ref") || link,
    title: pick(p, "title", "name", "projectName") || "Untitled bid project",
    org: pick(p, "officeName", "companyName", "organization", "owner", "gcName"),
    platform: "SmartBid",
    type: projectType || "RFQ",
    category: projectType || pick(p, "category", "sector", "market") || "Commercial",
    value: Number(p.estimatedValue ?? p.value ?? p.budget ?? p.squareFootage ?? 0) || 0,
    province: pick(p, "state", "province", "region"),
    city: pick(p, "city", "town"),
    published: pick(p, "publishedDate", "createdDate", "postedDate"),
    closing,
    status: pick(p, "status", "projectStatus") || "Open",
    tracked: false,
    address: pick(p, "address", "addressLine1", "street"),
    postalCode: pick(p, "zip", "postalCode", "zipCode"),
    bidUrl,
    contactName: pick(p, "bidManager", "contactName", "estimatorName", "primaryContact"),
    contactEmail: pick(p, "bidManagerEmail", "contactEmail", "estimatorEmail", "email"),
    contactPhone: pick(p, "bidManagerPhone", "contactPhone", "estimatorPhone", "phone"),
    contactFax: pick(p, "contactFax", "fax"),
    codes: JSON.stringify(codes),
    note: null as string | null,
    desc: pick(p, "description", "scope", "summary"),
  };
}

// ── Live read-through ──────────────────────────────────────────────────────
// Fetch + map SmartBid opportunities on demand. Read-only: does NOT write to the
// database. Returns [] (never throws) so the page degrades gracefully if SmartBid
// is unreachable or not configured.
export async function fetchLiveTenders(): Promise<ReturnType<typeof mapProjectToTender>[]> {
  if (!isSmartBidConfigured()) return [];
  try {
    const projects = await fetchSmartBidProjects();
    return projects.map(mapProjectToTender).filter((t) => t.id !== "sb_");
  } catch (err) {
    console.error("SmartBid live fetch failed:", err);
    return [];
  }
}

// ── Sync ──────────────────────────────────────────────────────────────────────
// Upserts every SmartBid project into our Tender table (keyed on "sb_<id>", so
// re-runs update in place and never touch manually-created "Internal" tenders).
export async function syncTenders(): Promise<{ created: number; updated: number; total: number }> {
  const projects = await fetchSmartBidProjects();
  let created = 0;
  let updated = 0;

  for (const p of projects) {
    const data = mapProjectToTender(p);
    if (!data.id || data.id === "sb_") continue; // skip records with no id
    const existing = await db.tender.findUnique({ where: { id: data.id }, select: { id: true } });
    await db.tender.upsert({ where: { id: data.id }, create: data, update: data });
    if (existing) updated++;
    else created++;
  }

  return { created, updated, total: projects.length };
}
