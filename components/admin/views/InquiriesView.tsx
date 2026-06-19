"use client";

import { useState, useEffect } from "react";
import { StatCard, Card, Spinner } from "../ui";

type Inquiry = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  company: string;
  message: string;
  read: boolean;
};

export default function InquiriesView() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => r.json())
      .then((data) => { setInquiries(data); setLoading(false); });
  }, []);

  const markRead = async (id: string, read: boolean) => {
    setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, read } : i));
    await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    setDeletingId(id);
    await fetch(`/api/contact/${id}`, { method: "DELETE" });
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    if (expanded === id) setExpanded(null);
    setDeletingId(null);
  };

  const unread = inquiries.filter((i) => !i.read).length;
  const total = inquiries.length;

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Unread" value={unread} hint="awaiting review" />
        <StatCard label="Total" value={total} hint="all time submissions" />
        <StatCard label="Read" value={total - unread} hint="already reviewed" />
      </div>

      <Card title="Contact Inquiries">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner className="h-6 w-6" /></div>
        ) : inquiries.length === 0 ? (
          <p className="py-12 text-center font-mono text-sm text-concrete-400">No inquiries yet.</p>
        ) : (
          <div className="divide-y divide-concrete-100">
            {inquiries.map((inq) => (
              <div key={inq.id} className={`px-5 py-4 transition-colors ${!inq.read ? "bg-brand-50/40" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Unread dot */}
                    <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!inq.read ? "bg-brand-600" : "bg-transparent"}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-ink">{inq.name}</span>
                        {inq.company && (
                          <span className="font-mono text-[11px] text-concrete-400">· {inq.company}</span>
                        )}
                      </div>
                      <a href={`mailto:${inq.email}`} className="font-mono text-xs text-brand-700 hover:text-brand-800">
                        {inq.email}
                      </a>
                      <div className="font-mono text-[11px] text-concrete-400">
                        {new Date(inq.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
                      className="font-display text-xs font-semibold text-concrete-500 hover:text-ink"
                    >
                      {expanded === inq.id ? "Hide" : "View"}
                    </button>
                    <button
                      type="button"
                      onClick={() => markRead(inq.id, !inq.read)}
                      className={`font-display text-xs font-semibold ${inq.read ? "text-concrete-400 hover:text-ink" : "text-brand-700 hover:text-brand-800"}`}
                    >
                      {inq.read ? "Mark unread" : "Mark read"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(inq.id)}
                      disabled={deletingId === inq.id}
                      className="font-display text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50"
                    >
                      {deletingId === inq.id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>

                {expanded === inq.id && (
                  <div className="ml-5 mt-3 rounded-lg border border-concrete-200 bg-white p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{inq.message}</p>
                    <div className="mt-3 flex gap-3">
                      <a
                        href={`mailto:${inq.email}?subject=Re: Your enquiry`}
                        className="rounded-md bg-brand-700 px-3 py-1.5 font-display text-xs font-semibold text-white hover:bg-brand-800"
                      >
                        Reply via email →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
