"use client";

import Link from "next/link";
import { TENDERS, money } from "@/lib/admin";
import { StatCard, Card, Pill, AccessDenied } from "../ui";

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-sm text-concrete-500">{k}</dt>
      <dd className="text-right font-display text-sm font-semibold text-ink">{v}</dd>
    </div>
  );
}

export default function TenderDetailView({ id }: { id: string }) {
  const t = TENDERS.find((x) => x.id === id);
  if (!t) return <AccessDenied msg="Tender not found." />;
  const tone = t.status === "Open" ? "green" : t.status === "Closing soon" ? "amber" : "gray";

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/tenders" className="font-mono text-xs text-concrete-500 hover:text-brand-700">← All tenders</Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-black tracking-tight text-ink">{t.title}</h2>
          <Pill text={t.status} tone={tone} />
        </div>
        <p className="mt-1 font-mono text-xs text-concrete-500">{t.ref} · {t.org} · {t.platform}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Est. value" value={money(t.value)} />
        <StatCard label="Type" value={t.type} />
        <StatCard label="Closing" value={t.closing} />
        <StatCard label="Location" value={`${t.city}, ${t.province}`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Description"><div className="px-5 py-5 leading-relaxed text-concrete-600">{t.desc}</div></Card>
          <Card title="Your notes">
            <div className="px-5 py-5">
              {t.note ? <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">{t.note}</p> : <p className="text-sm text-concrete-400">No notes yet.</p>}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Buyer contact">
            <dl className="divide-y divide-concrete-100 px-5">
              <Fact k="Name" v={t.contact.name} />
              <Fact k="Email" v={t.contact.email} />
              <Fact k="Phone" v={t.contact.phone} />
            </dl>
          </Card>
          <Card title="Details">
            <dl className="divide-y divide-concrete-100 px-5">
              <Fact k="Reference" v={t.ref} />
              <Fact k="Category" v={t.category} />
              <Fact k="Published" v={t.published} />
              <Fact k="Closing" v={t.closing} />
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
