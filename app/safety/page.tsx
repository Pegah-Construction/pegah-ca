import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Safety — Pegah Construction Ltd.",
};

export default function SafetyPage() {
  return (
    <PageShell
      eyebrow="Safety first"
      title="Safety is our number-one priority."
      intro="We believe delivering quality construction safely is an attainable goal — and everyone in our organization shares responsibility for it."
    >
      <p className="max-w-2xl text-lg leading-relaxed text-concrete-500">
        Safety policy, certifications, and our record go here.
      </p>
    </PageShell>
  );
}
