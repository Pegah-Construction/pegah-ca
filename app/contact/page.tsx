"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { company } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <PageShell
      eyebrow="Get in touch"
      title="Let's build something."
      intro="Tell us about your project and our team will get back to you."
    >
      <div className="grid gap-12 lg:grid-cols-2">
        <Reveal direction="left">
          {status === "sent" ? (
            <div className="flex flex-col justify-center gap-4 rounded-xl border border-brand-200 bg-brand-50 px-8 py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-ink">Message received</h3>
                <p className="mt-1 text-concrete-500">Thank you, {form.name}. Our team will be in touch shortly.</p>
              </div>
              <button
                type="button"
                onClick={() => { setForm({ name: "", email: "", company: "", message: "" }); setStatus("idle"); }}
                className="self-start font-mono text-xs text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { label: "Name", key: "name", type: "text", required: true },
                { label: "Email", key: "email", type: "email", required: true },
                { label: "Company", key: "company", type: "text", required: false },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="font-mono text-xs uppercase tracking-label text-concrete-500">
                    {label}{required && <span className="ml-0.5 text-red-500">*</span>}
                  </label>
                  <input
                    type={type}
                    required={required}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => set(key, e.target.value)}
                    className="mt-2 w-full rounded-md border border-concrete-300 bg-white px-4 py-3 outline-none focus:border-brand-500"
                  />
                </div>
              ))}
              <div>
                <label className="font-mono text-xs uppercase tracking-label text-concrete-500">
                  Project details<span className="ml-0.5 text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  className="mt-2 w-full rounded-md border border-concrete-300 bg-white px-4 py-3 outline-none focus:border-brand-500"
                />
              </div>
              {status === "error" && (
                <p className="font-mono text-xs text-red-600">Something went wrong. Please try again.</p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-md bg-brand-700 px-6 py-3 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send enquiry →"}
              </button>
            </form>
          )}
        </Reveal>

        <Reveal direction="right" delay={100}>
          <div className="space-y-6">
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Office</h3>
              <p className="mt-2 leading-relaxed text-ink">
                {company.address.line1}<br />{company.address.line2}
              </p>
            </div>
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Phone</h3>
              <a href={company.phoneHref} className="mt-2 block text-ink hover:text-brand-700">{company.phone}</a>
            </div>
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Email</h3>
              <a href={`mailto:${company.email}`} className="mt-2 block text-ink hover:text-brand-700">{company.email}</a>
            </div>
          </div>
        </Reveal>
      </div>
    </PageShell>
  );
}
