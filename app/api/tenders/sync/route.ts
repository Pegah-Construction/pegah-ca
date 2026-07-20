import { isSmartBidConfigured, syncTenders, SmartBidNotConfiguredError } from "@/lib/smartbid";

// POST /api/tenders/sync — pull the latest bid projects from SmartBid and
// upsert them into our Tender table. Returns a count summary.
export async function POST() {
  if (!isSmartBidConfigured()) {
    return Response.json(
      { error: "SmartBid is not configured. Add the SMARTBID_* credentials to your environment." },
      { status: 503 }
    );
  }

  try {
    const result = await syncTenders();
    return Response.json(result);
  } catch (err) {
    if (err instanceof SmartBidNotConfiguredError) {
      return Response.json({ error: err.message }, { status: 503 });
    }
    console.error("SmartBid sync failed:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "SmartBid sync failed." },
      { status: 502 }
    );
  }
}
