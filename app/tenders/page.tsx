import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import TenderList, { type PublicTender } from "@/components/TenderList";
import { db } from "@/lib/db";
import { company } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tenders — Pegah Construction Ltd.",
  description:
    "Active bid opportunities where Pegah Construction is seeking qualified subcontractor quotes across Southern Ontario.",
};

export default async function TendersPage() {
  const rows = await db.tender.findMany({
    orderBy: { closing: "asc" },
    select: {
      id: true,
      ref: true,
      title: true,
      org: true,
      type: true,
      category: true,
      province: true,
      city: true,
      closing: true,
      status: true,
    },
  });

  const tenders = rows as PublicTender[];

  return (
    <PageShell
      eyebrow="Bid opportunities"
      title="Active Tenders"
      intro="We are currently seeking qualified subcontractor quotes on the following active bids. Contact our estimating team to submit your quote."
    >
      <TenderList tenders={tenders} />

      <div className="mt-20 rounded-2xl bg-brand-700 px-8 py-12 text-center lg:px-16">
        <p className="font-mono text-xs uppercase tracking-label text-brand-200">
          Subcontractors &amp; Suppliers
        </p>
        <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-white lg:text-4xl">
          Work with Pegah
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-brand-100">
          We partner with skilled trades and suppliers across Southern Ontario.
          Reach out to our estimating team to discuss current and upcoming
          opportunities.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={`mailto:${company.email}`}
            className="rounded-md bg-white px-6 py-3 font-display text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
          >
            Contact our estimating team →
          </a>
          <a
            href={company.phoneHref}
            className="font-mono text-sm tracking-wide text-brand-200 transition-colors hover:text-white"
          >
            {company.phone}
          </a>
        </div>
      </div>
    </PageShell>
  );
}
