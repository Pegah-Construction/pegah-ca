"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Eyebrow } from "@/components/Brand";

const PROVINCES = [
  "Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba",
  "Saskatchewan", "Nova Scotia", "New Brunswick",
  "Newfoundland and Labrador", "Prince Edward Island",
  "Northwest Territories", "Nunavut", "Yukon",
];

const CERTS: { key: "isCOR" | "isWSIB" | "isBonded" | "isInsured"; label: string; desc: string }[] = [
  { key: "isCOR", label: "COR Certified", desc: "Certificate of Recognition for health & safety" },
  { key: "isWSIB", label: "WSIB in Good Standing", desc: "Workplace Safety and Insurance Board" },
  { key: "isBonded", label: "Bonded", desc: "Performance and labour & material payment bonds" },
  { key: "isInsured", label: "Liability Insurance ≥ $2M", desc: "General commercial liability coverage" },
];

const TRADES = [
  { div: "02", label: "Demolition & Site Remediation" },
  { div: "03", label: "Concrete & Formwork" },
  { div: "04", label: "Masonry" },
  { div: "05", label: "Structural Steel & Metals" },
  { div: "06", label: "Carpentry & Millwork" },
  { div: "07", label: "Roofing & Waterproofing" },
  { div: "08", label: "Doors, Frames, Hardware & Glazing" },
  { div: "09A", label: "Drywall & Ceilings" },
  { div: "09B", label: "Flooring" },
  { div: "09C", label: "Painting & Coatings" },
  { div: "09D", label: "Tile & Stone" },
  { div: "10", label: "Specialties & Signage" },
  { div: "11", label: "Equipment" },
  { div: "14", label: "Elevators & Conveying Systems" },
  { div: "21", label: "Fire Suppression" },
  { div: "22", label: "Plumbing" },
  { div: "23", label: "HVAC & Mechanical" },
  { div: "26", label: "Electrical" },
  { div: "27", label: "Low Voltage & Communications" },
  { div: "28", label: "Security & Access Control" },
  { div: "31", label: "Earthwork & Excavation" },
  { div: "32", label: "Exterior Improvements & Landscaping" },
  { div: "33", label: "Utilities & Underground Services" },
];

const inputCls = "mt-1.5 w-full rounded-md border border-concrete-300 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30";
const labelCls = "block font-mono text-[11px] uppercase tracking-label text-concrete-500";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-concrete-200 bg-white">
      <div className="border-b border-concrete-200 px-6 py-4">
        <h2 className="font-display text-sm font-bold tracking-tight text-ink">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>
      {children}
    </div>
  );
}

type FormState = {
  companyName: string; phone: string; fax: string; website: string;
  address: string; city: string; province: string; postalCode: string;
  firstName: string; lastName: string; title: string;
  email: string; confirmEmail: string; contactPhone: string; mobile: string;
  trades: string[];
  isCOR: boolean; isWSIB: boolean; isBonded: boolean; isInsured: boolean;
  notes: string;
};

const emptyForm = (): FormState => ({
  companyName: "", phone: "", fax: "", website: "",
  address: "", city: "", province: "", postalCode: "",
  firstName: "", lastName: "", title: "",
  email: "", confirmEmail: "", contactPhone: "", mobile: "",
  trades: [],
  isCOR: false, isWSIB: false, isBonded: false, isInsured: false,
  notes: "",
});

export default function SubcontractorRegisterPage() {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleTrade = (div: string) =>
    setForm((f) => ({
      ...f,
      trades: f.trades.includes(div) ? f.trades.filter((t) => t !== div) : [...f.trades, div],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.email !== form.confirmEmail) { setError("Email addresses do not match."); return; }
    if (form.trades.length === 0) { setError("Please select at least one trade division."); return; }
    setSubmitting(true);
    const res = await fetch("/api/subcontractors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Submission failed. Please try again.");
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-paper">
          <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-brand-700">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4 12 14.01l-3-3" />
              </svg>
            </div>
            <h1 className="mt-6 font-display text-3xl font-black tracking-tight text-ink">Registration received</h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-concrete-500">
              Thank you for registering with Pegah Construction. Our estimating team will review your submission and be in touch.
            </p>
            <a href="/" className="mt-8 inline-flex rounded-md bg-brand-700 px-6 py-3 font-display text-sm font-semibold text-white hover:bg-brand-800">
              Back to home
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-paper">

        {/* Header */}
        <section className="border-b border-concrete-200 bg-white">
          <div className="mx-auto max-w-8xl px-6 py-14 lg:px-10">
            <Eyebrow className="hero-animate" style={{ animationDelay: "0ms" }}>Tenders</Eyebrow>
            <h1 className="hero-animate mt-3 font-display text-4xl font-black tracking-tight text-ink lg:text-5xl" style={{ animationDelay: "120ms" }}>
              Subcontractor Registration
            </h1>
            <div className="hero-animate mt-5 grid max-w-4xl gap-6 text-base leading-relaxed text-concrete-500 sm:grid-cols-2" style={{ animationDelay: "260ms" }}>
              <p>
                Register to be included in our directory of subcontractors. Registration is free and will make your company&rsquo;s information available to our Estimating Department.
              </p>
              <p>
                Once registered, you will receive project invitations from our team as relevant opportunities arise. Keep your profile updated as your trades and capacity change.
              </p>
            </div>
          </div>
        </section>

        {/* Form */}
        <div className="mx-auto max-w-4xl px-6 py-14 lg:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">

            <Reveal>
              <Section title="Company Information">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Company Name" required>
                      <input required className={inputCls} value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Acme Mechanical Inc." />
                    </Field>
                  </div>
                  <Field label="Phone" required>
                    <input required type="tel" className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(416) 555-0100" />
                  </Field>
                  <Field label="Fax">
                    <input type="tel" className={inputCls} value={form.fax} onChange={(e) => set("fax", e.target.value)} placeholder="(416) 555-0101" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Website">
                      <input type="url" className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://example.com" />
                    </Field>
                  </div>
                </div>
                <div className="mt-6 border-t border-concrete-100 pt-6">
                  <p className={`${labelCls} mb-4`}>Physical Address</p>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Street Address">
                        <input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Industrial Pkwy" />
                      </Field>
                    </div>
                    <Field label="City" required>
                      <input required className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Toronto" />
                    </Field>
                    <Field label="Postal Code" required>
                      <input required className={inputCls} value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} placeholder="M3H 5T5" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Province" required>
                        <select required className={inputCls} value={form.province} onChange={(e) => set("province", e.target.value)}>
                          <option value="">Select province…</option>
                          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </Field>
                    </div>
                  </div>
                </div>
              </Section>
            </Reveal>

            <Reveal delay={80}>
              <Section title="Contact Information">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="First Name" required>
                    <input required className={inputCls} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
                  </Field>
                  <Field label="Last Name" required>
                    <input required className={inputCls} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Title / Position">
                      <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Project Manager, Estimator" />
                    </Field>
                  </div>
                  <Field label="Email" required>
                    <input required type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} />
                  </Field>
                  <Field label="Confirm Email" required>
                    <input required type="email" className={inputCls} value={form.confirmEmail} onChange={(e) => set("confirmEmail", e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <input type="tel" className={inputCls} value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
                  </Field>
                  <Field label="Mobile">
                    <input type="tel" className={inputCls} value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
                  </Field>
                </div>
              </Section>
            </Reveal>

            <Reveal delay={160}>
              <Section title="Trade Divisions / Codes">
                <p className="mb-5 text-sm leading-relaxed text-concrete-500">
                  Select all divisions that apply to your company. This determines which project invitations you receive. <span className="font-semibold text-red-600">At least one selection is required.</span>
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {TRADES.map((t) => (
                    <label key={t.div} className="flex cursor-pointer items-start gap-3 rounded-lg border border-concrete-200 px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50/50 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-concrete-300 accent-brand-700"
                        checked={form.trades.includes(t.div)}
                        onChange={() => toggleTrade(t.div)}
                      />
                      <span className="text-sm text-ink">
                        <span className="mr-1.5 font-mono text-[11px] text-concrete-400">Div. {t.div}</span>
                        {t.label}
                      </span>
                    </label>
                  ))}
                </div>
              </Section>
            </Reveal>

            <Reveal delay={240}>
              <Section title="Certifications & Compliance">
                <div className="grid gap-3 sm:grid-cols-2">
                  {CERTS.map((cert) => (
                    <label key={cert.key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-concrete-200 px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50/50 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-concrete-300 accent-brand-700"
                        checked={form[cert.key]}
                        onChange={(e) => set(cert.key, e.target.checked)}
                      />
                      <span className="text-sm">
                        <span className="font-semibold text-ink">{cert.label}</span>
                        <span className="ml-1 text-concrete-500">· {cert.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </Section>
            </Reveal>

            <Reveal delay={320}>
              <Section title="Additional Information">
                <Field label="Notes (optional)">
                  <textarea
                    rows={4}
                    className={inputCls}
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Describe your company's experience, geographic coverage, or anything else relevant to our estimating team."
                  />
                </Field>
              </Section>
            </Reveal>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Reveal delay={400}>
              <div className="flex items-center justify-between border-t border-concrete-200 pt-6">
                <p className="text-xs text-concrete-400">
                  Fields marked <span className="text-red-500">*</span> are required.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-brand-700 px-8 py-3 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit registration →"}
                </button>
              </div>
            </Reveal>

          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
