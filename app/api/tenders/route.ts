import { db } from "@/lib/db";
import { mapTender } from "@/lib/api-helpers";

export async function GET() {
  const tenders = await db.tender.findMany({ orderBy: { closing: "asc" } });
  return Response.json(tenders.map(mapTender));
}
