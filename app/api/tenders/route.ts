import { db } from "@/lib/db";
import { mapTender } from "@/lib/api-helpers";
import { fetchSmartBidProjects, isSmartBidConfigured, mapProjectToTender } from "@/lib/smartbid";

// Opportunities with a deadline come first, soonest first; undated ones follow.
const byClosing = (a: { closing: string }, b: { closing: string }) =>
  Number(!a.closing) - Number(!b.closing) || a.closing.localeCompare(b.closing);

/**
 * SmartBid owns the tender list, so the dashboard reads the same live feed the
 * public page does rather than whatever the last sync happened to store — a
 * closed tender leaves SmartBid and has to leave this list with it.
 *
 * The stored table is the fallback for when SmartBid can't be reached, and the
 * home of any tender added here by hand ("sb_" ids are the mirrored ones).
 * `X-Tenders-Source` tells the caller which of the two it got.
 */
export async function GET() {
  const stored = await db.tender.findMany({ orderBy: { closing: "asc" } });

  if (isSmartBidConfigured()) {
    try {
      const live = (await fetchSmartBidProjects())
        .map(mapProjectToTender)
        .filter((t) => t.id !== "sb_");
      const internal = stored.filter((t) => !t.id.startsWith("sb_"));
      const rows = [...live, ...internal].sort(byClosing).map(mapTender);
      return Response.json(rows, { headers: { "X-Tenders-Source": "live" } });
    } catch (err) {
      console.error("SmartBid live read failed — serving the last synced copy:", err);
    }
  }

  return Response.json(stored.map(mapTender), { headers: { "X-Tenders-Source": "stored" } });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.title?.trim()) {
    return Response.json({ error: "Title is required." }, { status: 400 });
  }
  const tender = await db.tender.create({
    data: {
      id: `t_${Date.now().toString(36)}`,
      title: body.title.trim(),
      ref: body.ref?.trim() ?? "",
      org: body.org?.trim() ?? "",
      platform: body.platform?.trim() || "Internal",
      type: body.type?.trim() || "RFQ",
      category: body.category?.trim() || "Commercial",
      value: parseFloat(body.value) || 0,
      province: body.province?.trim() ?? "",
      city: body.city?.trim() ?? "",
      published: body.published?.trim() ?? "",
      closing: body.closing?.trim() ?? "",
      status: body.status?.trim() || "Open",
      tracked: false,
      address: body.address?.trim() ?? "",
      postalCode: body.postalCode?.trim() ?? "",
      bidUrl: body.bidUrl?.trim() ?? "",
      contactName: body.contactName?.trim() ?? "",
      contactEmail: body.contactEmail?.trim() ?? "",
      contactPhone: body.contactPhone?.trim() ?? "",
      contactFax: body.contactFax?.trim() ?? "",
      codes: JSON.stringify(Array.isArray(body.codes) ? body.codes : []),
      note: body.note?.trim() ?? "",
      desc: body.desc?.trim() ?? "",
    },
  });
  return Response.json(mapTender(tender), { status: 201 });
}
