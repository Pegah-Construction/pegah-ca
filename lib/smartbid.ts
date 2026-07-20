// SmartBid (ConstructConnect) tender integration.
//
// SmartBid's API is account-gated — there is no public/open API. Fill these in
// .env from your ConstructConnect / SmartBid API credentials:
//
//   SMARTBID_API_BASE        Base URL of the API, e.g. https://api.smartbidnet.com
//   SMARTBID_AUTH            "apikey" (default) or "oauth"
//   SMARTBID_API_KEY         Static API key / bearer token        (when SMARTBID_AUTH=apikey)
//   SMARTBID_AUTH_HEADER     Header to send the key in            (default: "Authorization")
//   SMARTBID_AUTH_SCHEME     Prefix for the key value             (default: "Bearer ")
//   SMARTBID_TOKEN_URL       OAuth2 token endpoint                (when SMARTBID_AUTH=oauth)
//   SMARTBID_CLIENT_ID       OAuth2 client id                     (when SMARTBID_AUTH=oauth)
//   SMARTBID_CLIENT_SECRET   OAuth2 client secret                 (when SMARTBID_AUTH=oauth)
//   SMARTBID_PROJECTS_PATH   Endpoint listing bid projects, e.g. /v1/bidprojects
//
// The two functions marked "CONFIRM" below (fetchSmartBidProjects, mapProjectToTender)
// need to be matched to your account's actual endpoint + response fields — see the
// checklist in the sync route. Everything else (auth, upsert, dedupe) is ready.

import { db } from "@/lib/db";

export class SmartBidNotConfiguredError extends Error {
  constructor(message = "SmartBid API is not configured.") {
    super(message);
    this.name = "SmartBidNotConfiguredError";
  }
}

export function isSmartBidConfigured(): boolean {
  const base = process.env.SMARTBID_API_BASE;
  const hasApiKey = !!process.env.SMARTBID_API_KEY;
  const hasOAuth = !!(process.env.SMARTBID_CLIENT_ID && process.env.SMARTBID_CLIENT_SECRET && process.env.SMARTBID_TOKEN_URL);
  return !!base && (hasApiKey || hasOAuth);
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

async function authHeaders(): Promise<Record<string, string>> {
  const mode = (process.env.SMARTBID_AUTH || "apikey").toLowerCase();
  if (mode === "oauth") {
    return { Authorization: `Bearer ${await getOAuthToken()}` };
  }
  const header = process.env.SMARTBID_AUTH_HEADER || "Authorization";
  const scheme = process.env.SMARTBID_AUTH_SCHEME ?? "Bearer ";
  return { [header]: `${scheme}${process.env.SMARTBID_API_KEY}` };
}

// ── Fetch ───────────────────────────────────────────────────────────────────
// CONFIRM: the path (SMARTBID_PROJECTS_PATH) and how the list is wrapped in the
// response. This handles a bare array or the common { data | items | results }.
export type SmartBidProject = Record<string, unknown>;

export async function fetchSmartBidProjects(): Promise<SmartBidProject[]> {
  if (!isSmartBidConfigured()) throw new SmartBidNotConfiguredError();

  const base = process.env.SMARTBID_API_BASE!.replace(/\/$/, "");
  const path = process.env.SMARTBID_PROJECTS_PATH || "/bidprojects";
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json", ...(await authHeaders()) },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SmartBid API ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  if (Array.isArray(json)) return json;
  for (const key of ["data", "items", "results", "projects", "bidProjects"]) {
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
  const sbId = pick(p, "id", "projectId", "bidProjectId", "publicId");
  const bidUrl =
    pick(p, "publicUrl", "bidUrl", "url") ||
    (sbId ? `https://securecc.smartinsight.co/#/PublicBidProject/${sbId}` : "");
  const codesRaw = (p.codes ?? p.divisions ?? p.tradeCodes) as unknown;
  const codes = Array.isArray(codesRaw) ? codesRaw.map(String) : [];

  return {
    id: `sb_${sbId}`,
    ref: pick(p, "number", "projectNumber", "ref", "referenceNumber") || sbId,
    title: pick(p, "name", "title", "projectName") || "Untitled bid project",
    org: pick(p, "companyName", "organization", "owner", "gcName"),
    platform: "SmartBid",
    type: pick(p, "bidType", "type") || "RFQ",
    category: pick(p, "category", "sector", "market") || "Commercial",
    value: Number(p.estimatedValue ?? p.value ?? p.budget ?? 0) || 0,
    province: pick(p, "province", "state", "region"),
    city: pick(p, "city", "town"),
    published: pick(p, "publishedDate", "createdDate", "postedDate"),
    closing: pick(p, "bidDueDate", "dueDate", "closingDate", "bidDate"),
    status: pick(p, "status") || "Open",
    tracked: false,
    address: pick(p, "address", "addressLine1", "street"),
    postalCode: pick(p, "postalCode", "zip", "zipCode"),
    bidUrl,
    contactName: pick(p, "contactName", "estimatorName", "primaryContact"),
    contactEmail: pick(p, "contactEmail", "estimatorEmail", "email"),
    contactPhone: pick(p, "contactPhone", "estimatorPhone", "phone"),
    contactFax: pick(p, "contactFax", "fax"),
    codes: JSON.stringify(codes),
    note: null as string | null,
    desc: pick(p, "description", "scope", "summary"),
  };
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
